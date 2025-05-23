# Zenoti API Integration Troubleshooting

## Current Status

We've been attempting to connect to the Zenoti API to retrieve center IDs, but are encountering authentication issues. The script is correctly reading environment variables from `.env.local`, but API calls are failing with `401 Unauthorized` errors.

## Key Findings

1. The Zenoti API URL with your organization-specific subdomain (`https://api.alluremd.zenoti.com`) is being used correctly. This subdomain is unique to your Zenoti account.

2. We've tried two authentication methods:
   - Password-based authentication using account name, username, and password
   - Client credentials authentication using app key/ID and app secret

3. Both authentication methods are failing with either:
   - `401 Unauthorized` - "Invalid account" error
   - `500 Internal Server Error` - "Unable to generate token" error

4. Environment variables are being loaded correctly from `.env.local`, but there may be confusion about which credentials are required for API access.

## Possible Issues

1. **Incorrect API Credentials**: The API keys/secrets may be incorrect or expired.

2. **API Access Not Enabled**: Your Zenoti account may not have API access enabled.

3. **Endpoint Format**: The API endpoints may have changed or may be different for your specific Zenoti instance.

4. **Authentication Method**: The authentication method required by your Zenoti instance may be different from what we're trying.

5. **SSL Certificate Issues**: There might be SSL certificate validation issues when connecting to the custom subdomain.

## Recommended Next Steps

1. **Verify API Credentials with Zenoti Support**:
   - Confirm the correct API URL for your account
   - Verify which authentication method should be used
   - Ensure your account has API access enabled
   - Get fresh API credentials if needed

2. **Check Documentation**:
   - Review any Zenoti API documentation provided to your organization
   - Look for specific authentication requirements for your account

3. **Environment Variables**:
   - Ensure the following variables are correctly set in `.env.local`:
     - `ZENOTI_API_URL`: Should be `https://api.alluremd.zenoti.com`
     - `ZENOTI_APP_KEY` or `ZENOTI_APP_ID`: Your application key/ID
     - `ZENOTI_APP_SECRET`: Your application secret
     - `ZENOTI_ACCOUNT_NAME`: Your account name (likely "alluremd")
     - `ZENOTI_USER_NAME` and `ZENOTI_PASSWORD`: If using password authentication

4. **Test with Postman or Similar Tool**:
   - Try making API requests outside of the application to isolate if it's a code issue or an API access issue

## Current Script Approach

The current script in `scripts/get-center-id.ts` attempts to:

1. Load environment variables from `.env.local`
2. Try both authentication methods (password and client credentials)
3. Try both API URLs (custom subdomain and generic Zenoti API)
4. Provide detailed error information for troubleshooting

Despite these approaches, we're still encountering authentication issues, which suggests the problem may be with the API credentials or account configuration rather than the code itself. 