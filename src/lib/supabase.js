import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for data fetching
export const dataService = {
  // Fetch reviews
  async getReviews(count = 3) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('quote, client')
        .eq('is_active', true)
        .limit(count);

      if (error) {
        console.error('Error fetching reviews:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  },

  // Fetch quotes
  async getQuotes(count = 3) {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('text, author')
        .eq('is_active', true)
        .limit(count);

      if (error) {
        console.error('Error fetching quotes:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching quotes:', error);
      return [];
    }
  },

  // Get user profile
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  // Get schedule access for user
  async getScheduleAccess(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('has_schedule_access')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching schedule access:', error);
        return false;
      }

      return data?.has_schedule_access || false;
    } catch (error) {
      console.error('Error fetching schedule access:', error);
      return false;
    }
  }
};