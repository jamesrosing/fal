'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shared/ui/tabs';
import { Button } from '@/components/shared/ui/button';
import { CheckCircle, AlertCircle, RefreshCw, Server, Settings, Info } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/shared/ui/alert';
import { Badge } from '@/components/shared/ui/badge';
import CldImage from '@/components/shared/media/CldImage';
import CldVideo from '@/components/shared/media/CldVideo';


export default function ZenotiAdminPage() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [serviceCount, setServiceCount] = useState(0);
  const [providerCount, setProviderCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionDetails, setConnectionDetails] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('status');
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [cacheMessage, setCacheMessage] = useState<string | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setStatus('loading');
    setErrorMessage('');
    try {
      const response = await fetch('/api/zenoti/status');
      const data = await response.json();
      if (data.success) {
        setStatus('connected');
        setServiceCount(data.serviceCount || 0);
        setProviderCount(data.providerCount || 0);
      } else {
        setStatus('error');
        setErrorMessage(data.message || 'Unknown error occurred');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Failed to connect to Zenoti API');
      console.error('Error checking Zenoti status:', error);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await checkConnection();
    setIsRefreshing(false);
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    setConnectionDetails(null);
    
    try {
      const response = await fetch('/api/zenoti/test-connection');
      const data = await response.json();
      setConnectionDetails(data);
      
      // Also update the main status
      if (data.success) {
        setStatus('connected');
        setServiceCount(data.data?.serviceCount || 0);
        setProviderCount(data.data?.providerCount || 0);
        setErrorMessage('');
      } else {
        setStatus('error');
        setErrorMessage(data.message || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error testing Zenoti connection:', error);
      setConnectionDetails({
        success: false,
        message: 'Failed to test connection',
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const clearCache = async () => {
    setIsClearingCache(true);
    setCacheMessage(null);
    
    try {
      const response = await fetch('/api/zenoti/clear-cache', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success) {
        setCacheMessage(`Successfully cleared ${data.clearedCount} cache entries`);
      } else {
        setCacheMessage(`Failed to clear cache: ${data.message}`);
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
      setCacheMessage('Failed to clear cache due to an error');
    } finally {
      setIsClearingCache(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Zenoti Integration Dashboard</CardTitle>
          <CardDescription>
            Manage and monitor your Zenoti API integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="status" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger value="test">Test Connection</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="status">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {status === 'connected' ? (
                    <CheckCircle className="text-green-500" />
                  ) : status === 'error' ? (
                    <AlertCircle className="text-red-500" />
                  ) : (
                    <RefreshCw className="animate-spin" />
                  )}
                  <span>
                    Status: {status === 'connected' ? 'Connected' : status === 'error' ? 'Error' : 'Loading'}
                  </span>
                </div>
                {status === 'connected' && (
                  <>
                    <p>Services Available: {serviceCount}</p>
                    <p>Providers Available: {providerCount}</p>
                  </>
                )}
                {status === 'error' && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}
                <div className="flex gap-2">
                  <Button onClick={refreshData} disabled={isRefreshing}>
                    <RefreshCw className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button variant="outline" onClick={() => { setActiveTab('test'); testConnection(); }}>
                    <Server className="mr-2" />
                    Test Connection
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="test">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Connection Test</h3>
                  <Button onClick={testConnection} disabled={isTestingConnection}>
                    <RefreshCw className={`mr-2 ${isTestingConnection ? 'animate-spin' : ''}`} />
                    Run Test
                  </Button>
                </div>
                
                {isTestingConnection && (
                  <div className="flex items-center justify-center p-8">
                    <RefreshCw className="animate-spin mr-2" />
                    <span>Testing connection...</span>
                  </div>
                )}
                
                {connectionDetails && (
                  <div className="space-y-4">
                    <Alert variant={connectionDetails.success ? "default" : "destructive"}>
                      {connectionDetails.success ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <AlertTitle>{connectionDetails.success ? "Success" : "Error"}</AlertTitle>
                      <AlertDescription>{connectionDetails.message}</AlertDescription>
                    </Alert>
                    
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-2 flex items-center">
                        <Settings className="h-4 w-4 mr-2" />
                        Environment Variables
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {connectionDetails.environment?.variables && Object.entries(connectionDetails.environment.variables).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-sm font-mono">{key}</span>
                            <Badge variant={value === '✓ Set' ? 'default' : 'destructive'}>
                              {String(value)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {connectionDetails.success && connectionDetails.data && (
                      <div className="border rounded-md p-4">
                        <h4 className="font-medium mb-2 flex items-center">
                          <Info className="h-4 w-4 mr-2" />
                          API Data
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Services</span>
                            <Badge variant="outline">{connectionDetails.data.serviceCount}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Providers</span>
                            <Badge variant="outline">{connectionDetails.data.providerCount}</Badge>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {!connectionDetails.success && connectionDetails.error && (
                      <div className="border border-red-200 rounded-md p-4 bg-red-50">
                        <h4 className="font-medium mb-2 text-red-800">Error Details</h4>
                        <pre className="text-xs overflow-auto p-2 bg-red-100 rounded">
                          {JSON.stringify(connectionDetails.error, null, 2)}
                        </pre>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      Test performed at: {connectionDetails.timestamp ? new Date(connectionDetails.timestamp).toLocaleString() : 'Unknown'}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="settings">
              <div className="space-y-4">
                <p>API settings are configured via environment variables in the <code className="bg-gray-100 p-1 rounded">.env.local</code> file.</p>
                
                <div className="border rounded-md p-4">
                  <h4 className="font-medium mb-2">Required Environment Variables</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><code className="font-mono bg-gray-100 p-1 rounded">ZENOTI_API_URL</code> - The base URL for the Zenoti API</li>
                    <li><code className="font-mono bg-gray-100 p-1 rounded">ZENOTI_API_KEY</code> - Your Zenoti API key</li>
                    <li><code className="font-mono bg-gray-100 p-1 rounded">ZENOTI_API_SECRET</code> - Your Zenoti API secret</li>
                    <li><code className="font-mono bg-gray-100 p-1 rounded">ZENOTI_APPLICATION_ID</code> - Your Zenoti application ID</li>
                  </ul>
                </div>
                
                <div className="border rounded-md p-4">
                  <h4 className="font-medium mb-2 flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    Cache Management
                  </h4>
                  <p className="text-sm mb-4">
                    Clear the Zenoti API cache to fetch fresh data from the API. This can be useful if you've made changes to your Zenoti configuration.
                  </p>
                  <div className="flex items-center gap-4">
                    <Button 
                      variant="outline" 
                      onClick={clearCache} 
                      disabled={isClearingCache}
                    >
                      <RefreshCw className={`mr-2 ${isClearingCache ? 'animate-spin' : ''}`} />
                      Clear Zenoti Cache
                    </Button>
                    {cacheMessage && (
                      <span className={`text-sm ${cacheMessage.includes('Successfully') ? 'text-green-600' : 'text-red-600'}`}>
                        {cacheMessage}
                      </span>
                    )}
                  </div>
                </div>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Note</AlertTitle>
                  <AlertDescription>
                    After updating environment variables, you may need to restart the development server for changes to take effect.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}