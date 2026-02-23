#!/usr/bin/env node

const puppeteer = require('puppeteer');

const TWEET_SELECTOR = 'article[data-testid="tweet"]';
const TWEET_URL_RE = /^https?:\/\/(x\.com|twitter\.com)\/([^/]+)\/status\/(\d+)/;

function printUsage() {
  console.log(`Usage: tweet-screenshot [options] <tweet-url>

Screenshot a tweet from X/Twitter.

Arguments:
  tweet-url    URL of the tweet (x.com or twitter.com)

Options:
  -o, --output <file>  Output filename (default: <username>_<tweetId>.png)
  --no-border          Don't add a border around the tweet
  -h, --help           Show this help message

Examples:
  tweet-screenshot https://x.com/elonmusk/status/1234567890
  tweet-screenshot -o shot.png https://x.com/user/status/123
  tweet-screenshot --no-border https://twitter.com/user/status/456
  tweet-screenshot                          # interactive mode`);
}

function parseTweetUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    console.error(`Error: Invalid URL "${url}"`);
    process.exit(1);
  }

  const match = url.match(TWEET_URL_RE);
  if (!match) {
    console.error(`Error: Not a tweet URL. Expected format: https://x.com/<user>/status/<id>`);
    process.exit(1);
  }

  return { username: match[2], tweetId: match[3] };
}

async function parseArgs(args) {
  const result = { border: true, output: null, url: null };

  const positional = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '-h' || arg === '--help') {
      printUsage();
      process.exit(0);
    } else if (arg === '--no-border') {
      result.border = false;
    } else if (arg === '-o' || arg === '--output') {
      result.output = args[++i];
      if (!result.output) {
        console.error('Error: --output requires a filename');
        process.exit(1);
      }
    } else {
      positional.push(arg);
    }
  }

  if (positional.length >= 1) {
    result.url = positional[0];
  } else {
    const rl = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const ask = (q) => new Promise((resolve) => rl.question(q, resolve));
    result.url = await ask('Enter tweet URL: ');
    rl.close();
  }

  return result;
}

async function dismissModals(page) {
  // Try to dismiss login/cookie modals that X may show
  const dismissSelectors = [
    '[data-testid="xMigrationBottomBar"] button',   // "X" migration banner
    '[role="button"][aria-label="Close"]',            // generic close buttons
    'div[data-testid="sheetDialog"] button[data-testid="app-bar-close"]', // sheet dialogs
  ];

  for (const sel of dismissSelectors) {
    try {
      const btn = await page.waitForSelector(sel, { timeout: 1500 });
      if (btn) await btn.click();
    } catch {
      // No modal found — that's fine
    }
  }

  // Also try clicking away any overlay
  try {
    const overlay = await page.$('div[data-testid="mask"]');
    if (overlay) await overlay.click();
  } catch {
    // No overlay
  }

  // Hide the "Don't miss what's happening" login bar
  await page.evaluate(() => {
    const bar = document.querySelector('[data-testid="BottomBar"]');
    if (bar) bar.style.display = 'none';
  });
}

async function main() {
  const { url, border, output } = await parseArgs(process.argv.slice(2));
  const { username, tweetId } = parseTweetUrl(url);
  const filename = output || `${username}_${tweetId}.png`;

  let browser;
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Stealth: realistic user-agent
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
    );

    // Stealth: hide webdriver flag
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });

    await page.goto(url, { waitUntil: 'networkidle2' });
    await dismissModals(page);
    await page.waitForSelector(TWEET_SELECTOR, { timeout: 15000 });

    const element = await page.$(TWEET_SELECTOR);
    if (!element) {
      console.error('Error: Tweet element not found on page');
      process.exit(1);
    }

    if (border) {
      await page.evaluate((sel) => {
        document.querySelector(sel).style.border = '1px solid #ddd';
      }, TWEET_SELECTOR);
    }

    await element.screenshot({ path: filename });
    console.log(`Screenshot saved as ${filename}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

main();
