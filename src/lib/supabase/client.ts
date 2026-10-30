import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) {
  throw new Error("Supabase is not set up: copy .env.example to .env.local and fill in the URL and the publishable key.");
}

// One client for reading public data. It only holds the publishable key, which is meant to be
// public: what it may read or write is decided by the Row Level Security rules in Supabase
// (see supabase/projects.sql). The secret / service_role key never belongs in this project.
export const supabase = createClient(url, key);
