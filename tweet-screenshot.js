const puppeteer = require('puppeteer');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
const urlLib = require('url');

readline.question('Enter the URL: ', url => {
    readline.question('Enter the CSS selector of the element: ', async selector => {
        const urlParts = urlLib.parse(url);
        const domain = urlParts.hostname;
        const path = urlParts.path.replace(/\//g, '_');
        const filename = `${domain}${path}.png`;

        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1920 });
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        try {
            await page.waitForSelector(selector, { timeout: 5000 }); // waits for 5 seconds
            const element = await page.$(selector);
            // Add a border to the element
            await page.evaluate((selector) => {
                const element = document.querySelector(selector);
                element.style.border = '1px solid #ddd';
            }, selector);
            await element.screenshot({path: filename});
            console.log(`Screenshot saved as ${filename} in the current directory.`);
        } catch (error) {
            console.log('No element found with the provided selector within the time limit.');
        }
        await browser.close();
        readline.close();
    });
});
