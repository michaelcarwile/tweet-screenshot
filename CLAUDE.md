# CLAUDE.md

## Project Overview

`tweet-screenshot` is a Node.js CLI tool that takes a screenshot of a specific DOM element on any webpage. Despite the name, it works with any URL and CSS selector, not just tweets. It uses Puppeteer to launch a headless Chromium browser, navigate to a URL, and capture a screenshot of a selected element.

## Repository Structure

```
tweet-screenshot/
├── tweet-screenshot.js   # Main (and only) application script
├── package.json          # Dependencies (puppeteer ^20.7.2)
├── .gitignore            # Ignores node_modules/ and package-lock.json
└── CLAUDE.md             # This file
```

This is a single-file project. All logic lives in `tweet-screenshot.js`.

## How It Works

1. Prompts the user via stdin for a URL and a CSS selector
2. Launches headless Chromium via Puppeteer
3. Sets viewport to 1920x1920
4. Navigates to the URL (waits for `domcontentloaded`)
5. Waits up to 5 seconds for the selector to appear
6. Adds a light border (`1px solid #ddd`) to the element
7. Screenshots the element and saves it as `{domain}{path}.png` in the current directory

## Development

### Prerequisites

- Node.js (compatible with Puppeteer ^20.7.2)
- Chromium dependencies installed on the system (Puppeteer downloads its own Chromium, but system-level libs may be needed on Linux)

### Install Dependencies

```sh
npm install
```

### Run

```sh
node tweet-screenshot.js
```

The tool will interactively prompt for a URL and CSS selector.

### No Build Step

There is no build, transpilation, or bundling. The project uses plain CommonJS (`require`).

### No Tests

There is no test suite. The project has no test framework configured.

### No Linting

There is no linter or formatter configured.

## Key Conventions

- **Runtime**: Node.js with CommonJS modules (`require`)
- **Single dependency**: Puppeteer (headless browser automation)
- **Interactive CLI**: Uses `readline` for user input; not designed for non-interactive/piped usage
- **Output**: Screenshots are saved as PNG files in the working directory, named by the URL's domain and path
- **Error handling**: Catches selector timeout errors and logs a message; other errors are unhandled
- **URL parsing**: Uses the legacy `url.parse()` API (not the WHATWG `URL` constructor)
