# Watchdog Scheduler

The Watchdog project now uses a configurable scheduler for automated scraping with Facebook scraping disabled by default.

## Key Features

- **Configurable Interval**: Uses the `scrapeInterval` setting from the database (default: 60 minutes)
- **Facebook Disabled**: Facebook scraping is disabled for scheduled runs but can still be run manually
- **Traditional Sites Only**: Scheduled runs only scrape Dogshome, PetRescue, and AdoptAPet
- **Simple Implementation**: Uses `setInterval` instead of cron to avoid Next.js module issues

## Usage

### Starting the Scheduler

You can start the scheduler in several ways:

1. **Standalone Process** (Recommended):

   ```bash
   cd ts
   nvm use 20
   npm run scheduler:start
   ```

2. **API Control**:

   ```bash
   # Start via API
   curl -X POST -H "Content-Type: application/json" -d '{"action": "start"}' http://localhost:3001/api/test-scheduler

   # Stop via API
   curl -X POST -H "Content-Type: application/json" -d '{"action": "stop"}' http://localhost:3001/api/test-scheduler

   # Check status
   curl http://localhost:3001/api/test-scheduler
   ```

### Manual Scraping

Facebook scraping and full scraping can still be run manually:

```bash
cd ts
nvm use 20

# Run all sites including Facebook
npm run scrape:all

# Run only Facebook
npm run scrape:facebook

# Run only traditional sites (same as scheduled scraping)
npm run scrape:traditional
```

### API Endpoints

#### Simple Scheduler Control

```
GET /api/test-scheduler
```

Response:

```json
{
  "success": true,
  "message": "Simple scheduler test endpoint",
  "currentInterval": 60,
  "schedulerStatus": {
    "isRunning": false,
    "intervalMinutes": 60,
    "nextRunIn": "Stopped"
  },
  "instructions": {
    "start": "POST /api/test-scheduler with {\"action\": \"start\"}",
    "stop": "POST /api/test-scheduler with {\"action\": \"stop\"}",
    "status": "GET /api/test-scheduler",
    "update": "POST /api/test-scheduler with {\"action\": \"update\"}"
  },
  "note": "Facebook scraping is disabled for scheduled runs"
}
```

#### Control Actions

```
POST /api/test-scheduler
```

Actions:

- `{"action": "start"}` - Start the scheduler
- `{"action": "stop"}` - Stop the scheduler
- `{"action": "update"}` - Update interval from database setting

## Settings

The scheduler uses the `scrapeInterval` setting from the database:

- **Default**: 60 minutes
- **Minimum**: 1 minute (for testing)
- **Recommended**: 30-120 minutes

You can update this setting through the web interface or API.

## Implementation Details

### Why Simple Scheduler?

The original implementation used `node-cron` but had compatibility issues with Next.js Turbopack. The simple scheduler:

- Uses native `setInterval` for reliability
- Avoids module resolution issues
- Provides the same functionality
- Is easier to debug and maintain

### Schedule Logic

- **Interval**: Runs every N minutes as configured in database
- **Initial Run**: Executes immediately when started, then on interval
- **Facebook**: Completely excluded from scheduled runs
- **Error Handling**: Continues running even if individual scrapes fail

## Important Notes

1. **Node Version**: Always use Node 20 (`nvm use 20`) in the `ts` directory
2. **Facebook Scraping**: Disabled for scheduled runs but available manually
3. **Background Process**: The scheduler runs as a background process and must be manually stopped with Ctrl+C
4. **Error Handling**: Failed scraping attempts are logged but don't stop the scheduler
5. **Interval Updates**: The scheduler checks for interval updates every 5 minutes

## Troubleshooting

If the scheduler isn't working:

1. Check Node version: `node --version` (should be 20.x)
2. Check if process is running: Look for "Scheduler is now running!" message
3. Check API status: `curl http://localhost:3001/api/test-scheduler`
4. Restart scheduler: Stop with Ctrl+C and restart with `npm run scheduler:start`
5. Test manual scraping: `npm run scrape:traditional`

## Migration from Previous System

- Legacy `cron` scheduler is deprecated but APIs still exist
- Use `simpleScheduler` instead of `scheduler` for new integrations
- Traditional scheduling commands still work but use the simple implementation
