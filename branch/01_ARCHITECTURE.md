# Architecture

Scheduler
↓

Category Scraper

↓

Product URL Collector

↓

Queue

↓

Product Scraper

↓

Validation

↓

Normalization

↓

Database

↓

Export

---

## Components

### Scheduler

Starts scraping.

---

### Browser

Uses Playwright.

Responsible for:

- opening browser
- navigating pages
- waiting correctly

---

### URL Collector

Collects product URLs.

Never extracts product details.

Only URLs.

---

### Queue

Stores URLs waiting to scrape.

Supports resume.

---

### Product Scraper

Visits each URL.

Extracts all fields.

---

### Validation

Checks:

- title exists
- price exists
- images exist

---

### Database

Stores normalized products.

---

### Export

Exports:

JSON

CSV

Excel