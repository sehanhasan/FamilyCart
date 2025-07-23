import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(`Missing Supabase environment variables. URL: ${supabaseUrl ? 'Set' : 'Missing'}, Key: ${supabaseAnonKey ? 'Set' : 'Missing'}`);
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  throw new Error(`Invalid Supabase URL format: ${supabaseUrl}`);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          color?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string;
          created_at?: string;
        };
      };
      grocery_items: {
        Row: {
          id: string;
          name: string;
          category: string;
          quantity: number;
          priority: 'low' | 'high' | 'medium';
          status: 'to-buy' | 'bought';
          added_by: string;
          bought_by: string | null;
          bought_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category?: string;
          quantity?: number;
          priority?: 'low' | 'high' | 'medium';
          status?: 'to-buy' | 'bought';
          added_by: string;
          bought_by?: string | null;
          bought_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          quantity?: number;
          priority?: 'low' | 'high' | 'medium';
          status?: 'to-buy' | 'bought';
          added_by?: string;
          bought_by?: string | null;
          bought_at?: string | null;
          created_at?: string;
        };
      };
    };
  };
}