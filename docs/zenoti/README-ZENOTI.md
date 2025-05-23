# Zenoti API Integration Guide

This guide explains how to properly set up the Zenoti API integration for your application.

## Prerequisites

Before you begin, you'll need:
- A Zenoti account with API access
- API credentials from Zenoti (API Key, Secret, Application ID)
- Access to your application's environment variables (.env.local file)

## Understanding the Integration

The appointment booking system uses the Zenoti API to:
- Fetch available services
- Fetch available providers/therapists
- Check availability for specific services
- Book appointments

## Getting Zenoti API Credentials

If you don't already have API credentials:

1. Contact your Zenoti account manager or support team
2. Request API access for your Zenoti instance
3. Explain that you need credentials for accessing services, providers, and booking appointments
4. They should provide you with:
   - API URL (usually https://api.zenoti.com)
   - API Key
   - API Secret
   - Application ID

## Updating Your Credentials

Once you have your credentials:

1. Open the `.env.local` file in the root of your project
2. Locate the Zenoti section (or add it if it doesn't exist):

```
# Zenoti API Configuration
ZENOTI_API_URL=https://api.zenoti.com
ZENOTI_API_KEY=your_api_key_here
ZENOTI_API_SECRET=your_api_secret_here
ZENOTI_APPLICATION_ID=your_application_id_here
```

3. Replace the placeholder values with your actual credentials
4. Save the file
5. Restart your application server for the changes to take effect

## Testing Your Connection

After updating your credentials:

1. Visit `/admin/zenoti-setup` in your application
2. Click "Test Connection" to verify your credentials are working
3. If successful, you should see a success message with the number of services found
4. If unsuccessful, check the error message and ensure your credentials are correct

## Common Issues

### 401 Unauthorized Error

This means your API credentials are invalid or expired. Solutions:
- Double-check that you've entered the credentials correctly
- Ensure your Zenoti account has API access enabled
- Contact Zenoti support to verify your credentials are active

### 403 Forbidden Error

This means your API key doesn't have permission to access the requested resources. Solutions:
- Contact Zenoti support to ensure your API key has the proper permissions
- Request expanded access to the necessary endpoints

### No Services/Providers Returned

If the connection is successful but no services or providers are returned:
- Check with Zenoti that your account is properly configured
- Ensure your center's services and providers are properly set up in Zenoti

## Support

If you continue to have issues:
1. Take a screenshot of the error from the `/admin/zenoti-setup` page
2. Note the exact steps you took
3. Contact your application support team with these details 