'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { CldImage } from '../components/media/CldImage';
import { CldVideo } from '../components/media/CldVideo';


export default function ZenotiSetupPage() {
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [credentials, setCredentials] = useState({
    apiUrl: '',
    apiKey: '',
    apiSecret: '',
    applicationId: ''
  });

  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/zenoti-credentials');
      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      console.error('Error testing connection:', error);
      setTestResult({
        status: 'error',
        message: 'Failed to test connection',
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setLoading(false);
    }
  };

  // Load credentials on mount
  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const response = await fetch('/api/zenoti-credentials');
        const data = await response.json();
        if (data.credentials) {
          setCredentials({
            apiUrl: data.credentials.ZENOTI_API_URL || '',
            apiKey: '', // Don't pre-fill for security
            apiSecret: '', // Don't pre-fill for security
            applicationId: data.credentials.ZENOTI_APPLICATION_ID || ''
          });
        }
      } catch (error) {
        console.error('Error loading credentials:', error);
      }
    };
    
    loadCredentials();
  }, []);

  const handleSaveCredentials = async () => {
    setLoading(true);
    try {
      // This would need a server endpoint to securely update the .env file
      // For security, we're just showing the UI here without implementation
      alert('To update your Zenoti credentials, you need to modify the .env.local file directly. This UI is just for testing the connection.');
      
      // For a real implementation, you would need a secure admin API to update env vars
      // const response = await fetch('/api/admin/update-zenoti-credentials', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(credentials)
      // });
      // const data = await response.json();
      // if (data.success) {
      //   alert('Credentials updated successfully. Restart the server for changes to take effect.');
      // }
    } catch (error) {
      console.error('Error saving credentials:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="container mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold mb-8">Zenoti API Setup</h1>
        
        <div className="grid gap-8 max-w-3xl">
          <div className="bg-zinc-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Current Zenoti Connection Status</h2>
            
            <Button 
              onClick={testConnection} 
              disabled={loading}
              className="mb-6"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Connection'
              )}
            </Button>
            
            {testResult && (
              <Alert variant={testResult.status === 'success' ? 'default' : 'destructive'} className="mb-4">
                {testResult.status === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle>
                  {testResult.status === 'success' ? 'Connection Successful' : 'Connection Failed'}
                </AlertTitle>
                <AlertDescription>
                  {testResult.message}
                  {testResult.status === 'success' && (
                    <p className="mt-2">Found {testResult.services_count} services.</p>
                  )}
                  {testResult.response_status && (
                    <p className="mt-2">Status code: {testResult.response_status}</p>
                  )}
                  {testResult.error && (
                    <p className="mt-2">Error: {testResult.error}</p>
                  )}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="text-sm text-zinc-400">
              <p>The connection test checks if your Zenoti API credentials are valid and working.</p>
              <p className="mt-2">If the test fails, you need to update your credentials in the .env.local file.</p>
            </div>
          </div>
          
          <div className="bg-zinc-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Zenoti API Credentials</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="apiUrl">API URL</Label>
                <Input
                  id="apiUrl"
                  value={credentials.apiUrl}
                  onChange={(e) => setCredentials({ ...credentials, apiUrl: e.target.value })}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
              
              <div>
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={credentials.apiKey}
                  onChange={(e) => setCredentials({ ...credentials, apiKey: e.target.value })}
                  className="bg-zinc-800 border-zinc-700"
                  placeholder="Enter your Zenoti API Key"
                />
              </div>
              
              <div>
                <Label htmlFor="apiSecret">API Secret</Label>
                <Input
                  id="apiSecret"
                  type="password"
                  value={credentials.apiSecret}
                  onChange={(e) => setCredentials({ ...credentials, apiSecret: e.target.value })}
                  className="bg-zinc-800 border-zinc-700"
                  placeholder="Enter your Zenoti API Secret"
                />
              </div>
              
              <div>
                <Label htmlFor="applicationId">Application ID</Label>
                <Input
                  id="applicationId"
                  value={credentials.applicationId}
                  onChange={(e) => setCredentials({ ...credentials, applicationId: e.target.value })}
                  className="bg-zinc-800 border-zinc-700"
                  placeholder="Enter your Zenoti Application ID"
                />
              </div>
              
              <Button 
                onClick={handleSaveCredentials} 
                disabled={loading}
                className="mt-2"
              >
                {loading ? 'Saving...' : 'Save Credentials (Demo Only)'}
              </Button>
              
              <div className="mt-4 p-4 bg-amber-950 text-amber-300 rounded-md">
                <p className="text-sm">
                  <strong>Important:</strong> For security reasons, this demo UI cannot actually update your credentials. 
                  To update your Zenoti credentials, you need to edit the .env.local file directly.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-zinc-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">How to Get Zenoti API Credentials</h2>
            
            <ol className="list-decimal pl-5 space-y-2 text-zinc-300">
              <li>Contact your Zenoti account manager or support.</li>
              <li>Request API access credentials for your Zenoti instance.</li>
              <li>You'll need the API URL, API Key, API Secret, and Application ID.</li>
              <li>Once received, update these in your .env.local file.</li>
              <li>Restart your application server for the changes to take effect.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
} 