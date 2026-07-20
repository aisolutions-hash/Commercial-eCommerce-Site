# Moglix Product Scraper

## Goal

Build a production-quality scraper that extracts product information from ONE Moglix category.

The scraper should:

- Navigate category pages
- Discover every product
- Visit each product page
- Extract structured data
- Save data into PostgreSQL and JSON
- Support resumable scraping
- Include logging
- Include retries
- Handle failures gracefully

This is NOT a quick script.

The goal is to build software that can later be expanded to scrape additional categories.

---

## Success Criteria

The project is complete when:

✓ Every product in one category is scraped.

✓ Product details are normalized.

✓ Duplicate products are avoided.

✓ Failed pages can be retried.

✓ The scraper can resume after interruption.

✓ Logs clearly explain failures.

✓ Data is stored cleanly.