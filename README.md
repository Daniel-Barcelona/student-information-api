# Student Information API
 
A RESTful backend API built with Node.js, Express, TypeScript, and Supabase PostgreSQL for **ITE 303 — Web Systems and Technologies 2**.
 
## Features
 
- Read all student records (`GET /students`)
- Read a single student record by ID (`GET /students/:id`)
- Create a new student record (`POST /students`)
- Update an existing student record (`PUT /students/:id`)
- Delete a student record (`DELETE /students/:id`)
 
## Local Setup
 
1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Copy `.env.example` to `.env` and add your private Supabase PostgreSQL connection string.
3. Start the development server:
   ```bash
   pnpm dev
   ```