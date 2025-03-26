# Zenoti Integration Solution

## Current Issues

Based on the analysis of `ZENOTI-API-SUMMARY.md` and related files, the primary issues with the Zenoti integration are:

1. Authentication failures despite using correct credentials
2. Inconsistent API response formats
3. Lack of clear documentation on the correct authentication method
4. Possible IP restrictions or other account-specific limitations

## Recommended Solution Architecture

### 1. Tiered Authentication Approach

Implement a tiered authentication system that tries multiple authentication methods in sequence:

```typescript
// zenoti-auth.ts
export async function authenticateWithZenoti() {
  try {
    // Try OAuth Token with Password Grant
    const passwordGrantToken = await getTokenWithPasswordGrant();
    if (passwordGrantToken) return { token: passwordGrantToken, method: 'password_grant' };
    
    // Try OAuth Token with Client Credentials
    const clientCredentialsToken = await getTokenWithClientCredentials();
    if (clientCredentialsToken) return { token: clientCredentialsToken, method: 'client_credentials' };
    
    // Try Direct API Key
    const apiKeyAuth = await testApiKeyAuth();
    if (apiKeyAuth.success) return { token: process.env.ZENOTI_API_KEY, method: 'api_key', format: apiKeyAuth.format };
    
    // All methods failed
    return { success: false, error: 'All authentication methods failed' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### 2. Robust Caching Strategy

Implement a multi-level caching strategy to improve reliability and performance:

```typescript
// zenoti-cache.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

export async function getCachedData(key, fetchFn, ttlInSeconds = 3600) {
  try {
    // Try to get from cache first
    const cachedData = await redis.get(key);
    if (cachedData) return JSON.parse(cachedData);
    
    // Fetch fresh data
    const freshData = await fetchFn();
    
    // Store in cache for future use
    await redis.set(key, JSON.stringify(freshData), { ex: ttlInSeconds });
    
    return freshData;
  } catch (error) {
    console.error(`Cache error for key ${key}:`, error);
    // Try to fetch directly if cache fails
    return await fetchFn();
  }
}
```

### 3. Fallback Data System

Implement a fallback system for critical operations when the API is unavailable:

```typescript
// zenoti-fallback.ts
import fs from 'fs';
import path from 'path';

const FALLBACK_DIR = path.join(process.cwd(), 'data', 'zenoti-fallback');

// Ensure directory exists
if (!fs.existsSync(FALLBACK_DIR)) {
  fs.mkdirSync(FALLBACK_DIR, { recursive: true });
}

export async function getWithFallback(dataKey, fetchFn) {
  const fallbackPath = path.join(FALLBACK_DIR, `${dataKey}.json`);
  
  try {
    // Try to fetch live data
    const liveData = await fetchFn();
    
    // Update fallback data
    fs.writeFileSync(fallbackPath, JSON.stringify(liveData, null, 2));
    
    return liveData;
  } catch (error) {
    console.error(`Failed to fetch ${dataKey} from Zenoti:`, error);
    
    // Try to use fallback data
    if (fs.existsSync(fallbackPath)) {
      const fallbackData = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
      return {
        ...fallbackData,
        _isFallback: true,
        _fallbackReason: error.message,
      };
    }
    
    // No fallback data available
    return { 
      error: 'Service temporarily unavailable',
      _isFallback: true,
      _fallbackReason: 'No cached data available'
    };
  }
}
```

### 4. Enhanced Error Reporting

Implement detailed error reporting to help diagnose issues:

```typescript
// zenoti-diagnostics.ts
export async function runZenotiDiagnostics() {
  const diagnosticResults = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    apiUrl: process.env.ZENOTI_API_URL,
    credentials: {
      hasApiKey: !!process.env.ZENOTI_API_KEY,
      hasSecret: !!process.env.ZENOTI_API_SECRET,
      hasAppId: !!process.env.ZENOTI_APPLICATION_ID,
    },
    tests: {}
  };
  
  // Test authentication
  try {
    const authResult = await authenticateWithZenoti();
    diagnosticResults.tests.authentication = {
      success: authResult.success,
      method: authResult.method,
      error: authResult.error,
    };
  } catch (error) {
    diagnosticResults.tests.authentication = {
      success: false,
      error: error.message,
    };
  }
  
  // Test centers endpoint
  try {
    const centersResult = await fetchCenters();
    diagnosticResults.tests.centersEndpoint = {
      success: true,
      count: centersResult.length,
    };
  } catch (error) {
    diagnosticResults.tests.centersEndpoint = {
      success: false,
      error: error.message,
      status: error.status,
    };
  }
  
  // More tests for other endpoints...
  
  return diagnosticResults;
}
```

### 5. Zenoti Integration Monitoring

Set up a monitoring system to automatically detect and report integration issues:

```typescript
// zenoti-monitor.ts
export async function monitorZenotiIntegration() {
  // Run diagnostics
  const diagnosticResults = await runZenotiDiagnostics();
  
  // Check if there are critical failures
  const hasCriticalFailures = Object.values(diagnosticResults.tests)
    .some(test => !test.success);
  
  // Log diagnostics
  console.log(`[${diagnosticResults.timestamp}] Zenoti Integration Health Check:`, 
    hasCriticalFailures ? 'FAILED' : 'PASSED');
  
  // Store historical data
  await storeHistoricalDiagnostics(diagnosticResults);
  
  // Alert if needed
  if (hasCriticalFailures) {
    await sendAlertNotification({
      subject: 'Zenoti Integration Failure',
      body: `Zenoti integration has critical failures. See details: ${JSON.stringify(diagnosticResults, null, 2)}`,
    });
  }
  
  return {
    status: hasCriticalFailures ? 'failure' : 'success',
    details: diagnosticResults
  };
}
```

## Implementation Steps

1. **Contact Zenoti Support**
   - Share diagnostic results
   - Request specific authentication method for your account
   - Ask about IP restrictions or account-specific settings

2. **Implement Authentication System**
   - Create the tiered authentication approach
   - Add detailed logging for debugging
   - Set up automated testing for auth methods

3. **Develop Caching System**
   - Implement Redis cache for API responses
   - Set appropriate TTL for different data types
   - Add cache invalidation on important updates

4. **Create Fallback System**
   - Build the fallback data system
   - Keep fallback data updated when API is available
   - Add clear indicators when fallback data is used

5. **Set Up Monitoring**
   - Implement the monitoring system
   - Configure alerts for critical failures
   - Create a dashboard for integration health

6. **Refactor UI Components**
   - Update booking components to handle API failures gracefully
   - Add user-friendly error messages
   - Implement loading states and retry mechanisms

## Long-term Recommendations

1. **Create a Zenoti Integration Test Suite**
   - Automated tests for all API endpoints
   - Regular validation of authentication methods
   - Simulated error scenarios and recovery tests

2. **Develop a Local Development Mock**
   - Mock Zenoti API for local development
   - Simulate different response scenarios
   - Enable offline development

3. **Consider Alternative Booking Solutions**
   - Research alternative booking APIs as backup
   - Evaluate building a simplified in-house solution
   - Implement a hybrid approach that works with multiple providers
