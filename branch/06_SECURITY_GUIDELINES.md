# Security Guidelines

Never hardcode secrets.

Use .env.

Never commit passwords.

Validate all scraped data.

Handle network failures gracefully.

Respect reasonable request rates and avoid creating unnecessary load on the target site.

Log every exception.

Save browser screenshots when errors occur.

Never lose collected URLs.

Resume after crashes.

Create daily backups.

Sanitize filenames.

Avoid SQL injection by using parameterized queries.