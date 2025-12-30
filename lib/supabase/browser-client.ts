"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// --- UPDATED SCHEMA DEFINITION ---
type SupabaseSchema = {
  public: {
    Tables: {
      vault_items: {
        Row: {
          id: string;
          user_id: string;
          type: "password" | "card" | "crypto" | "file"; // Match the SQL check
          name: string;
          ciphertext: string; // This is the encrypted string
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "password" | "card" | "crypto" | "file";
          name: string;
          ciphertext: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: "password" | "card" | "crypto" | "file";
          name?: string;
          ciphertext?: string;
        };
      };
    };
  };
};

let client: SupabaseClient<SupabaseSchema> | null = null;

export function getSupabaseBrowserClient(): SupabaseClient<SupabaseSchema> {
  if (client) {
    return client;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  client = createBrowserClient<SupabaseSchema>(supabaseUrl, supabaseAnonKey);
  return client;
}