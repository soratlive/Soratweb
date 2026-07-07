# Project Architecture & Guidelines

This document guides the AI coding agent to design, build, and maintain the application strictly under the following stack and architecture:

## Core Tech Stack
- **Frontend**: React + Vite (SPA layout with fast, beautiful, and highly responsive components)
- **Hosting**: Cloudflare Pages (Static asset distribution)
- **Backend**: Cloudflare Workers (Edge-native serverless functions)
- **Database**: Cloudflare D1 (Serverless SQL database powered by SQLite)
- **Storage**: Cloudflare R2 (S3-compatible serverless object storage)
- **Authentication**: JWT-based secure authentication (State-less, fast, and edge-friendly)
- **APIs**: Workers routes representing all REST/RESTful services

## Project Structure Guidelines
- **GitHub-ready Structure**: Ensure files, configs, and directory layouts are structured standardly so the codebase can be committed and run immediately on external systems.
- **Environment Variables**: Define all necessary parameters in `.env.example`. Never commit actual API keys, credentials, or secrets directly in code files.
- **Production-ready Code**: Ensure all TypeScript files compile perfectly, pass linters, have proper error handling, robust retry mechanisms, and graceful fallbacks.
- **Modular Code**: Split large source modules into separate cohesive files (e.g., types, shared helpers, and reusable UI components) to keep token size compact and prevent cutoff errors during generation.
