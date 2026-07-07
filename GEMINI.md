# Custom System Instructions

When working on this codebase, prioritize the architectural decisions and technology preferences specified in **AGENTS.md**:

1. **Frontend**: React + Vite (fully structured SPA utilizing Tailwind CSS for beautiful styling and fluid layout animations).
2. **Hosting**: Cloudflare Pages.
3. **Backend**: Cloudflare Workers for edge serverless functions.
4. **Database**: Cloudflare D1 (SQL-based serverless SQLite).
5. **Storage**: Cloudflare R2 (Object storage).
6. **Authentication**: JWT (JSON Web Tokens).
7. **Production Quality**: Keep code modular, type-safe, and fully ready for production and GitHub synchronization with a clear `.env.example`.
