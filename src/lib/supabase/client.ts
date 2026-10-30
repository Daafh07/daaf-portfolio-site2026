import { createClient } from "@supabase/supabase-js";

// One client for reading public data. It only holds the publishable key, which is meant to be
// public: what it may read or write is decided by the Row Level Security rules in Supabase
// (see supabase/projects.sql). The secret / service_role key never belongs in this project.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);
