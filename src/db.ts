import { readFileSync } from 'node:fs';
import { Pool } from 'pg';
 
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is missing. Check your .env file.');
}

const connectionString = new URL(databaseUrl);
connectionString.searchParams.delete('sslmode');

export const pool = new Pool({
  connectionString: connectionString.toString(),
  ssl: {
    ca: readFileSync(new URL('../supabase-ca.crt', import.meta.url), 'utf8'),
  },
});