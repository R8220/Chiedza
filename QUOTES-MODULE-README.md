# Quotes Management Module

Added to this Chiedza build:

- New `Quote` Sequelize model.
- Admin route `/admin/quotes`.
- Add, edit, activate/deactivate, and delete quotes.
- Admin navigation link for Quotes.
- User dashboard displays one active quote per day.
- Quote categories, authors, and display order supported.
- Four starter quotes added to the seed script.

## Deployment note

The application already calls Sequelize sync when `AUTO_SYNC_DB=true`, so the Quotes table will be created automatically on startup in environments where automatic sync is enabled.

If you want the four starter quotes, run the project's seed command after deployment:

`npm run seed`

Do this only if running the existing seed script is appropriate for your environment, because it also maintains the project's demo seed data.

## Quote carousel update
The user dashboard now loads every active quote and shows them in a calm carousel. Quotes automatically advance every 12 seconds and users can also use Previous/Next controls. The timer pauses while the user hovers over or focuses the quote area, pauses while the browser tab is hidden, and respects the operating system's reduced-motion preference by disabling automatic rotation. Admin activation/deactivation continues to control which quotes appear.
