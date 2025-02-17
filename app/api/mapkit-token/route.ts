import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function GET() {
  try {
    const teamId = process.env.APPLE_TEAM_ID
    const keyId = process.env.APPLE_KEY_ID
    const privateKey = process.env.APPLE_PRIVATE_KEY?.replace(/\\n/g, '\n')

    if (!teamId || !keyId || !privateKey) {
      return new NextResponse('Missing Apple MapKit configuration', { status: 500 })
    }

    const token = jwt.sign({
      iss: teamId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // Token expires in 1 hour
    }, privateKey, {
      algorithm: 'ES256',
      header: {
        kid: keyId,
        typ: 'JWT'
      }
    })

    return new NextResponse(token)
  } catch (error) {
    console.error('Error generating MapKit JS token:', error)
    return new NextResponse('Error generating token', { status: 500 })
  }
} 