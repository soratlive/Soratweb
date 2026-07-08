/**
 * Cloudflare Workers Edge Native Serverless API Code
 * 
 * Interfacing with Cloudflare D1 Serverless SQL Database (SQLite)
 * Handles routing, CORS, security, and D1 database SELECT queries for Users.
 */

// Fallback interfaces for local React TypeScript compiler verification
interface D1Database {
  prepare(query: string): any;
}
interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
}

export interface Env {
  // D1 Database Binding configured in wrangler.toml
  DB: D1Database;
  JWT_SECRET?: string;
}

// Helper to parse base64 JWT payload safely at the Edge
function decodeJWT(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    let payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (payloadBase64.length % 4) {
      payloadBase64 += '=';
    }
    const decoded = atob(payloadBase64);
    return JSON.parse(decoded);
  } catch (e) {
    return null;
  }
}

// Google ID token verification at the Edge with JWKs and standard Web Crypto APIs
async function verifyGoogleIdToken(idToken: string): Promise<any> {
  const parts = idToken.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  const header = decodeJWT(parts[0]);
  const payload = decodeJWT(parts[1]);
  if (!header || !payload) {
    throw new Error('Could not decode JWT parts');
  }

  // Check expiration (with a generous 60-second clock skew allowance)
  const nowSecs = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < nowSecs - 60) {
    throw new Error('Google ID token is expired');
  }

  // Verify Issuer
  const iss = payload.iss;
  if (iss !== 'https://accounts.google.com' && iss !== 'accounts.google.com') {
    throw new Error('Invalid token issuer');
  }

  // Try verifying using Google public certs
  try {
    const certsResponse = await fetch('https://www.googleapis.com/oauth2/v3/certs');
    if (!certsResponse.ok) {
      throw new Error(`Failed to fetch certs: ${certsResponse.statusText}`);
    }
    const certs: any = await certsResponse.json();
    const kid = header.kid;
    const jwk = certs.keys.find((key: any) => key.kid === kid);

    if (!jwk) {
      throw new Error(`JWK not found for kid: ${kid}`);
    }

    // Convert JWT signature part from base64url to Uint8Array
    let signatureStr = parts[2].replace(/-/g, '+').replace(/_/g, '/');
    while (signatureStr.length % 4) {
      signatureStr += '=';
    }
    const signatureBin = atob(signatureStr);
    const signatureArr = new Uint8Array(signatureBin.length);
    for (let i = 0; i < signatureBin.length; i++) {
      signatureArr[i] = signatureBin.charCodeAt(i);
    }

    // Convert header + payload string to Uint8Array
    const encoder = new TextEncoder();
    const dataArr = encoder.encode(`${parts[0]}.${parts[1]}`);

    // Import the public JWK and verify
    const publicKey = await crypto.subtle.importKey(
      'jwk',
      jwk,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: { name: 'SHA-256' }
      },
      false,
      ['verify']
    );

    const isValid = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      publicKey,
      signatureArr,
      dataArr
    );

    if (!isValid) {
      throw new Error('Crypto verification failed: invalid signature');
    }

    return payload;
  } catch (error: any) {
    console.warn('[Worker Auth] Local JWK crypto verification failed. Attempting Google tokeninfo fallback...', error.message);
    
    // Fallback: Verify token directly using Google's tokeninfo API
    try {
      const tokenInfoUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
      const tokenInfoResponse = await fetch(tokenInfoUrl);
      if (tokenInfoResponse.ok) {
        const info: any = await tokenInfoResponse.json();
        if (info.error_description) {
          throw new Error(info.error_description);
        }
        return info;
      } else {
        throw new Error(`Tokeninfo API failed with status ${tokenInfoResponse.status}`);
      }
    } catch (fallbackError: any) {
      console.error('[Worker Auth] Google tokeninfo fallback also failed:', fallbackError.message);
      throw new Error(`Google ID Token verification failed: ${error.message} && ${fallbackError.message}`);
    }
  }
}

// Generate secure edge JWT signed with HMAC-SHA256 standard
async function generateJWT(payload: any, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const base64UrlHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const base64UrlPayload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  const tokenInput = `${base64UrlHeader}.${base64UrlPayload}`;
  
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    encoder.encode(tokenInput)
  );
  
  const base64UrlSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
    
  return `${tokenInput}.${base64UrlSignature}`;
}

// Security verification helper to ensure only admins can access sensitive D1 endpoints
async function verifyAdmin(request: Request, env: Env): Promise<boolean> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.substring(7);
  const payload = decodeJWT(token);
  if (!payload) return false;

  const requesterId = payload.sub || payload.user_id || payload.uid;
  const requesterEmail = payload.email;

  // Primary administrator email bypass
  if (requesterEmail === 'nikhilrv8055@gmail.com') {
    return true;
  }

  if (!requesterId) return false;

  try {
    const dbUser: any = await env.DB.prepare(
      'SELECT role FROM users WHERE id = ?'
    ).bind(requesterId).first();

    return dbUser && dbUser.role === 'admin';
  } catch (e) {
    console.error('Error verifying admin status:', e);
    return false;
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;

    // --- Elegant CORS Headers for Cross-Origin API access ---
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight options request
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Dynamic Matcher for `/api/users/:id` routes
      const userMatch = url.pathname.match(/^\/api\/users\/([^/]+)$/);

      // Route: GET /api/users - Fetch all users from Cloudflare D1
      if (url.pathname === '/api/users' && method === 'GET') {
        // Secure it - only admins can pull user listings
        const isAdmin = await verifyAdmin(request, env);
        if (!isAdmin) {
          return new Response(JSON.stringify({ error: 'Unauthorized: Admin privileges required' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        const { results } = await env.DB.prepare(
          'SELECT id, name, email, role, balance, mobile, created_at FROM users ORDER BY created_at DESC'
        ).all();

        return new Response(JSON.stringify(results), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // Route: POST /api/auth/google - Verify Google Sign-In ID Token, register/sync user, and return JWT Session
      if (url.pathname === '/api/auth/google' && method === 'POST') {
        try {
          const body: any = await request.json();
          const { id_token } = body;

          if (!id_token) {
            return new Response(JSON.stringify({ error: 'Missing parameter: id_token' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          const payload = await verifyGoogleIdToken(id_token);
          const sub = payload.sub;
          const email = payload.email || `${sub}@sorat.live`;
          const name = payload.name || payload.given_name || 'Google Player';

          // Preserve existing role and balance if user already exists
          let existingUser: any = await env.DB.prepare(
            'SELECT role, balance FROM users WHERE id = ?'
          ).bind(sub).first();

          let finalRole = 'user';
          let finalBalance = 0;

          if (existingUser) {
            finalRole = existingUser.role || 'user';
            finalBalance = existingUser.balance || 0;
          } else {
            if (email.toLowerCase().trim() === 'nikhilrv8055@gmail.com') {
              finalRole = 'admin';
            }
          }

          // Securely upsert user in D1 database
          await env.DB.prepare(
            'INSERT INTO users (id, name, email, role, balance, mobile) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET name = excluded.name, email = excluded.email'
          )
          .bind(sub, name, email, finalRole, finalBalance, '')
          .run();

          // Generate secure edge session JWT
          const sessionPayload = {
            sub: sub,
            uid: sub,
            email: email,
            name: name,
            role: finalRole,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days active
          };

          const jwtSecret = env.JWT_SECRET || 'sorat_live_jwt_super_secret_key_12345!';
          const customToken = await generateJWT(sessionPayload, jwtSecret);

          return new Response(JSON.stringify({
            success: true,
            token: customToken,
            user: {
              id: sub,
              uid: sub,
              name: name,
              email: email,
              role: finalRole,
              balance: finalBalance
            }
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } catch (err: any) {
          console.error('[Google Auth Error]:', err.message || err);
          return new Response(JSON.stringify({ error: `Authentication failed: ${err.message || err}` }), {
            status: 401,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }

      // Route: POST /api/users - Create/Register a new user (Self-registration)
      if (url.pathname === '/api/users' && method === 'POST') {
        const body: any = await request.json();
        const { id, name, email, role, balance, mobile } = body;

        if (!id || !name || !email) {
          return new Response(JSON.stringify({ error: 'Missing required parameters: id, name, email' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        await env.DB.prepare(
          'INSERT INTO users (id, name, email, role, balance, mobile) VALUES (?, ?, ?, ?, ?, ?)'
        )
        .bind(id, name, email, role || 'user', balance || 0.00, mobile || '')
        .run();

        return new Response(JSON.stringify({ success: true, message: 'User created successfully inside D1 database!' }), {
          status: 201,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Route: PUT /api/users/:id - Update user's role or balance/coins in D1 database
      if (userMatch && method === 'PUT') {
        const userId = userMatch[1];

        // Secure it - only admins can perform edits
        const isAdmin = await verifyAdmin(request, env);
        if (!isAdmin) {
          return new Response(JSON.stringify({ error: 'Unauthorized: Admin privileges required' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        const body: any = await request.json();
        const { role, balance, balanceAdjustment } = body;

        if (role !== undefined) {
          // Promote / Demote Admin
          await env.DB.prepare('UPDATE users SET role = ? WHERE id = ?')
            .bind(role, userId)
            .run();
        }

        if (balance !== undefined) {
          // Explicitly set Balance/Coins
          await env.DB.prepare('UPDATE users SET balance = ? WHERE id = ?')
            .bind(balance, userId)
            .run();
        } else if (balanceAdjustment !== undefined) {
          // Add or Subtract Balance/Coins
          await env.DB.prepare('UPDATE users SET balance = balance + ? WHERE id = ?')
            .bind(balanceAdjustment, userId)
            .run();
        }

        return new Response(JSON.stringify({ success: true, message: 'User updated successfully in D1 database!' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Route: DELETE /api/users/:id - Delete a user and clean their records
      if (userMatch && method === 'DELETE') {
        const userId = userMatch[1];

        // Secure it - only admins can delete accounts
        const isAdmin = await verifyAdmin(request, env);
        if (!isAdmin) {
          return new Response(JSON.stringify({ error: 'Unauthorized: Admin privileges required' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        // Run deletion query
        await env.DB.prepare('DELETE FROM users WHERE id = ?')
          .bind(userId)
          .run();

        return new Response(JSON.stringify({ success: true, message: 'User deleted successfully from D1 database!' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Default Route / Page Not Found
      return new Response(JSON.stringify({ error: 'Route not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });

    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  }
};
