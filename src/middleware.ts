// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const allowedOrigins = [
  'https://lucapacioli.com.tn',
  'https://tej-tool-r9qy767kl-bedouijessers-projects.vercel.app',
  'http://localhost:3000'
]

export function middleware(request: NextRequest) {
  // Get the origin from the request headers
  const origin = request.headers.get('origin')

  // Only handle /api/tej/* routes
  if (!request.nextUrl.pathname.startsWith('/api/tej/')) {
    return NextResponse.next()
  }

  // Check if origin is allowed
  const isAllowedOrigin = origin && allowedOrigins.includes(origin)

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': isAllowedOrigin ? origin : '',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  // Handle actual request
  const response = NextResponse.next()

  // Add CORS headers to response
  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  return response
}

export const config = {
  matcher: '/api/tej/:path*',
}
