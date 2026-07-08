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
}

// Helper to parse base64 JWT payload safely at the Edge
function decodeJWT(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(payloadBase64);
    return JSON.parse(decoded);
  } catch (e) {
    return null;
  }
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
