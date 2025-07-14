# Dog Watchdog

A Next.js application for tracking and managing dog adoption listings with automated scraping capabilities.

## Features

- 🐕 **Dog Database**: Track dogs with images, breeds, descriptions, and source links
- 🔄 **Auto-refresh**: Configurable dashboard refresh intervals
- ⚙️ **Settings**: Customizable scrape intervals and refresh rates
- 📱 **Responsive**: Works on desktop and mobile devices
- 🖼️ **Image Modal**: Click dog images to view in full size
- 🔍 **Detailed Views**: Comprehensive dog profile pages

## Getting Started

### 1. Setup Database

```bash
# Setup database with migrations and default data
npm run db:setup
```

### 2. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Database Management

This project uses **Drizzle ORM** with proper migrations. See [DATABASE.md](./DATABASE.md) for detailed documentation.

**Quick Commands:**

```bash
npm run db:setup     # Complete database setup
npm run db:generate  # Generate new migrations
npm run db:migrate   # Run migrations
npm run db:studio    # Open database GUI
npm run db:reset     # Reset database
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
