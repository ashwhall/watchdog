# WatchDog

Scrapes dog adoption listings from a collection of websites and Facebook pages/groups in order. This was built for a pretty specific purpose and tested on a single Ubuntu machine, so I can make no guarantees about its stability.

_Since writing the above, I had Claude (in VS Code Agent mode) rewrite the code in TypeScript, which is now the recommended version. The Python version is still available but is no longer maintained._

## Features

- 🔍 **Automated Scraping**: Regularly scrapes multiple dog adoption websites
- 🤖 **Telegram Notifications**: Get instant notifications when new dogs are found
- 📱 **Web Interface**: View and manage scraped dogs through a web interface
- 📊 **Database Storage**: SQLite database to track all found dogs
- ⏰ **Scheduled Jobs**: Automatic scraping on configurable schedules

## Setup

### TypeScript Version (Recommended)

The TypeScript version includes modern features, better error handling, and Telegram notifications.

1. **Prerequisites**

   ```bash
   # Ensure you have Node.js 20+ installed
   nvm use 20  # or install Node.js 20 if not available
   ```

2. **Install Dependencies**

   ```bash
   cd ts
   nvm use 20  # Important: Use Node.js 20 before all commands
   npm install
   ```

3. **Quick Setup (Recommended)**

   ```bash
   npm run init
   ```

   This will set up the database and optionally configure Telegram notifications.

   **Or Manual Setup:**

   a. **Database Setup**

   ```bash
   npm run db:setup
   ```

   b. **Configure Telegram Notifications (Optional but Recommended)**

   To receive notifications when new dogs are found, you can configure Telegram through the web interface:

   1. **Create a Telegram bot:**

      - Message [@BotFather](https://t.me/botfather) on Telegram
      - Use `/newbot` command
      - Follow instructions to create your bot
      - Copy the bot token

   2. **Get your chat ID:**

      - Start a conversation with your bot
      - Send any message to your bot
      - Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
      - Look for the "chat" object and copy the "id" value

   3. **Configure in the web interface:**
      - Start the web interface: `npm run dev`
      - Go to Settings page
      - Enable Telegram notifications
      - Enter your bot token and chat ID
      - Click "Test Telegram" to verify setup
      - Save settings

   **Alternative CLI Setup:**

   ```bash
   npm run telegram:setup  # Interactive setup wizard
   npm run telegram:test   # Test your configuration
   ```

4. **Run the Application**

   ```bash
   # Start the web interface
   npm run dev

   # Or run scraping directly
   npm run scrape:all
   ```

### Python Version (Legacy)

Install the requirements (probably in a virtual env of some sort):

```bash
pip3 install -r requirements.txt
```

Run it!

```bash
python3 run.py
```

Then enter your Facebook credentials to log in when prompted.

```
Enter Facebook credentials:
Email: xxxx@yyy.zzz
Password: ******
```

Can optionally provide the below flags:

```
  -h, --help           show this help message and exit
  --headless           Run Chrome in headless mode so no browser window is opened.
  --skip-first-scrape  Don't scrape on launch, wait the predetermined time first.
```

It's recommended to run with `--headless` so Chrome doesn't keep opening and closing and taking focus.

## Available Commands (TypeScript Version)

```bash
# Database commands
npm run db:setup        # Initialize database
npm run db:migrate      # Run database migrations
npm run db:reset        # Reset database
npm run db:studio       # Open database studio

# Scraping commands
npm run scrape:all      # Scrape all configured sites
npm run scrape:facebook # Scrape Facebook only

# Telegram commands
npm run telegram:setup   # Configure Telegram notifications
npm run telegram:test    # Test Telegram functionality
npm run telegram:manage  # Manage Telegram settings
npm run telegram:demo    # Demo with live scraping

# Development
npm run dev            # Start development server
npm run build          # Build for production
npm run start          # Start production server

# System setup
npm run init           # Initialize complete system (database + optional Telegram)
```

## Telegram Notification Features

When properly configured, the Telegram bot will:

- 🐕 **Individual Notifications**: Send a message for each new dog found with photo, name, breed, and description
- 📸 **Rich Media**: Include dog photos when available with formatted captions
- 🔗 **Direct Links**: Provide clickable links to adoption listings
- 📊 **Batch Summaries**: Send summary notifications when multiple dogs are found in a single scrape
- ⚡ **Real-time**: Notifications sent immediately when new dogs are discovered
- 🛡️ **Rate Limited**: Automatic delays between messages to prevent Telegram rate limiting
- ✅ **Testing Tools**: Built-in commands to test and verify your setup

### Telegram Commands

- `npm run telegram:setup` - Initial configuration wizard (CLI)
- `npm run telegram:test` - Send test notifications to verify setup (CLI)
- `npm run telegram:manage` - Interactive settings management (CLI)
- `npm run telegram:demo` - Run live scraping demo with notifications

**Recommended:** Use the web interface at `/settings` for easier configuration with real-time testing.

## Troubleshooting

### Node.js Version Issues

Always run `nvm use 20` before executing any npm commands in the `ts` directory.

### Telegram Not Working

1. Verify your bot token is correct
2. Ensure your chat ID is valid (numbers only, may be negative for groups)
3. Make sure you've sent at least one message to your bot
4. Run `npm run telegram:test` to diagnose issues

### Database Issues

If you encounter database problems, try:

```bash
npm run db:reset
npm run db:setup
```
