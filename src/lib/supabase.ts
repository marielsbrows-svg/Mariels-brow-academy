import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gjiitwltkcetkkxksjwq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqaWl0d2x0a2NldGtreGtzandxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyODQyOTQsImV4cCI6MjA5NDg2MDI5NH0.gOofHNwxnTi_V75FBv2lGN2fqi6Uf5jEhn7AEkcUJWA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () => {
  return true;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      courses: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          price: number;
          thumbnail_url: string | null;
          duration_hours: number | null;
          level: 'beginner' | 'intermediate' | 'advanced' | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          enrolled_at: string;
          completed_at: string | null;
        };
      };
      lesson_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          completed: boolean;
          last_position_seconds: number;
          completed_at: string | null;
          updated_at: string;
        };
      };
    };
  };
};
