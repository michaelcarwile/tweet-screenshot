# tweet-screenshot

CLI tool to screenshot tweets from X/Twitter. No API keys required — uses Puppeteer to render the tweet in a headless browser and captures the element directly.

## Requirements

- Node.js >= 18

## Install

```bash
git clone https://github.com/michaelcarwile/tweet-screenshot.git
cd tweet-screenshot
npm install
```

To make it available as a global command:

```bash
npm link
```

## Usage

```
tweet-screenshot [options] <tweet-url>
```

### Examples

```bash
# Screenshot a tweet (saves as username_tweetId.png)
tweet-screenshot https://x.com/AlexHormozi/status/2025679359147962387

# Custom output filename
tweet-screenshot -o quote.png https://x.com/AlexHormozi/status/2025679359147962387

# Without the border
tweet-screenshot --no-border https://x.com/AlexHormozi/status/2025679359147962387

# Interactive mode — prompts for the URL
tweet-screenshot
```

### Options

| Flag | Description |
|---|---|
| `-o, --output <file>` | Output filename (default: `<username>_<tweetId>.png`) |
| `--no-border` | Disable the light border around the tweet |
| `-h, --help` | Show help |

Both `x.com` and `twitter.com` URLs are accepted.

## How it works

1. Launches a headless Chromium browser via Puppeteer
2. Sets a realistic user-agent and hides automation flags to avoid login walls
3. Navigates to the tweet URL and waits for the page to settle
4. Dismisses any login/cookie modals that X may display
5. Waits for the tweet element (`article[data-testid="tweet"]`) to render
6. Captures a PNG screenshot of the tweet element

## Limitations

- Only works with public tweets. Private/protected accounts require authentication, which this tool does not support.
- X may change their DOM structure or add new blocking mechanisms at any time, which could break screenshot capture.
- Rate limiting or CAPTCHAs from X may cause failures if used heavily in a short period.

## Disclaimer

This tool is intended for personal, non-commercial use such as archiving your own tweets or capturing screenshots for commentary and discussion.

Automated access to X/Twitter may be subject to their [Terms of Service](https://x.com/en/tos). Scraping, bulk downloading, or redistribution of content may violate those terms. You are solely responsible for how you use this tool and for ensuring your usage complies with all applicable terms of service and laws.

This project is not affiliated with, endorsed by, or associated with X Corp. or Twitter, Inc.

## License

MIT
