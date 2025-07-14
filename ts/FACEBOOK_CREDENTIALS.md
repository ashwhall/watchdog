# Facebook Credentials Setup

This project now supports storing Facebook credentials securely for scraping purposes.

## Security Features

- **Password Encryption**: Facebook passwords are encrypted using AES-256-CBC encryption before being stored in the database
- **Environment Variable**: Set a custom encryption key using the `ENCRYPTION_KEY` environment variable
- **Validation**: Email format and password strength validation on the frontend

## Setup Instructions

1. **Set Encryption Key** (Recommended for Production):

   ```bash
   cp .env.example .env.local
   # Edit .env.local and set a strong ENCRYPTION_KEY
   ```

2. **Configure Credentials**:

   - Navigate to `/settings` in your web application
   - Scroll down to the "Facebook Credentials" section
   - Enter your Facebook email and password
   - Click "Save Settings"

3. **Use in Scraping Scripts**:

   ```typescript
   import {
     getFacebookCredentials,
     areFacebookCredentialsConfigured,
   } from '../lib/settings';

   // Check if credentials are configured
   if (await areFacebookCredentialsConfigured()) {
     const { email, password } = await getFacebookCredentials();
     // Use credentials for Facebook login
   }
   ```

4. **Run Facebook Scraping**:

   ```bash
   # Test just Facebook login
   npm run test-facebook-login

   # Test Facebook scraping
   npm run test-facebook-scraper

   # Debug Facebook login issues
   npm run debug-facebook-login

   # Run all scrapers including Facebook
   npm run test-scraper
   ```

## Troubleshooting

### Login Issues

If you encounter login failures:

1. **Debug the login process**:

   ```bash
   npm run debug-facebook-login
   ```

   This will take a screenshot and log all input fields and buttons found on the page.

2. **Check the screenshot**: Look for `facebook-debug.png` in your project root to see what the login page actually looks like.

3. **Common issues**:

   - Facebook changed their login page structure
   - Two-factor authentication is enabled
   - Account requires verification
   - Rate limiting from Facebook

4. **Manual verification**: Try logging in manually with the same credentials to ensure they work.

### Error Messages

- `TimeoutError: Waiting for selector failed`: The login page structure has changed
- `Login may have failed or requires additional verification`: Check for 2FA or security prompts
- `Facebook credentials not configured`: Set credentials in the settings page first

## Facebook Sources

The scraper automatically scrapes the following Facebook sources:

### Facebook Groups:

- Group ID: 571800346240922
- Group ID: 611101722623366

### Facebook Pages:

- DogRescueAssociationofVictoria
- vicdogrescue
- StartingOverDogRescue
- All4PawsDogRescue
- SecondChanceAnimalRescueInc
- PuppyTalesRescue
- rescuedwithlove
- FFARLatrobe
- FFARau
- LostDogsHome
- PetRescueAU
- RSPCA.Victoria
- petshavenfoundation
- Australiank9rescuevic
- TheAnimalRehomingService
- melbourneanimalrescue
- newbeginnings.animalrescueinc
- Krazy-Kat-Rescue-974224009276491

## API Endpoints

- `GET /api/settings` - Returns all settings (password is decrypted)
- `POST /api/settings` - Save a setting (password is automatically encrypted)

## Database Storage

- Facebook email is stored in plaintext in the `settings` table
- Facebook password is encrypted and stored in the `settings` table
- Encryption/decryption is handled automatically by the settings functions

## Security Notes

- Always use a strong, unique `ENCRYPTION_KEY` in production
- The encryption key should be kept secret and not committed to version control
- If you lose the encryption key, you'll need to re-enter the Facebook password
- Consider using environment-specific encryption keys for different deployments
- Facebook scraping uses the mobile touch interface for better compatibility
- The scraper automatically handles login and session management
