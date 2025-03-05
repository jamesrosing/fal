import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';

// Your Google OAuth credentials (store these in environment variables)
const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const REDIRECT_URI = process.env.NODE_ENV === 'production' 
  ? process.env.GOOGLE_OAUTH_REDIRECT_URI_PRODUCTION 
  : process.env.GOOGLE_OAUTH_REDIRECT_URI || 'http://localhost:3000/api/oauth/callback';

// Create OAuth client
const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

export async function GET(request: Request) {
  try {
    // Get URL and parse query parameters
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    
    console.log("OAuth callback received. URL:", url.toString());
    console.log("Environment:", process.env.NODE_ENV);
    console.log("Using redirect URI:", REDIRECT_URI);
    
    if (error) {
      console.error("OAuth error:", error);
      return NextResponse.redirect(new URL(`/contact?oauth_error=${error}`, url.origin));
    }
    
    if (!code) {
      console.error("Authorization code missing");
      return NextResponse.json({ error: 'Authorization code missing' }, { status: 400 });
    }
    
    // Exchange authorization code for tokens
    console.log("Exchanging code for tokens...");
    const { tokens } = await oAuth2Client.getToken(code);
    console.log("Token exchange successful");
    
    // In a production app, you would store these tokens securely
    // For example, in a database associated with the user session
    // NEVER expose tokens in client-side code
    
    // For this demo, we'll store the access token temporarily in a secure server-side session
    // or a secure HTTP-only cookie
    
    // Log token details (not the actual token!)
    if (tokens.access_token) {
      console.log("Access token received. Expires in:", tokens.expiry_date ? 
        new Date(tokens.expiry_date).toLocaleString() : 'unknown');
    }
    
    // Redirect to contact page
    return NextResponse.redirect(new URL('/contact?oauth_success=true', url.origin));
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    
    return NextResponse.json({ 
      error: 'OAuth authentication failed', 
      details: error.message 
    }, { status: 500 });
  }
} 