/**
 * Cloudflare Workers Edge Native Serverless API Code
 * 
 * Interfacing with Cloudflare D1 Serverless SQL Database (SQLite)
 * Handles routing, CORS, security, and D1 database SELECT queries for Users.
 */

export interface Env {
  // D1 Database Binding configured in wrangler.toml
  DB: D1Database;
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
      // Route: GET /api/users - Fetch all users from Cloudflare D1
      if (url.pathname === '/api/users' && method === 'GET') {
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

      // Route: POST /api/users - Create/Register a new user
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
