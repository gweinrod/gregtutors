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
  },

  // Upsert current user into clients by email. If row exists (e.g. admin-added), set auth_user_id and update name to OAuth name.
  async upsertClient({ id, email, name }) {
    if (!id || !email) return;
    try {
      await supabase
        .from('clients')
        .upsert(
          { email, name: name || email, auth_user_id: id, updated_at: new Date().toISOString() },
          { onConflict: 'email' }
        );
    } catch (error) {
      console.error('Error upserting client:', error);
    }
  },

  // Schedule events: returns rows (one-off and recurring). If userEmail is provided and the table has user_email, only that user's events are returned.
  async getScheduleEvents(userEmail = null) {
    const baseSelect = 'id, title, category, start_time, end_time, date, day_of_week, is_recurring, recurrence_interval, recurrence_end_date, created_at';
    try {
      let query = supabase
        .from('schedule_events')
        .select(baseSelect + ', user_email')
        .order('created_at', { ascending: true });

      if (userEmail) {
        query = query.eq('user_email', userEmail);
      }

      const { data, error } = await query;

      if (error) {
        if (error.code === '42703') {
          // column may be missing (user_email, recurrence_interval, or created_at) — retry with minimal set
          const fallbackSelect = 'id, title, category, start_time, end_time, date, day_of_week, is_recurring';
          const fallback = await supabase
            .from('schedule_events')
            .select(fallbackSelect)
            .order('created_at', { ascending: true });
          if (fallback.error) {
            console.error('Error fetching schedule events:', fallback.error);
            return [];
          }
          return fallback.data || [];
        }
        console.error('Error fetching schedule events:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching schedule events:', error);
      return [];
    }
  },

  async createScheduleEvent({ title, date, start, end, cat, user_email: userEmail, is_recurring, day_of_week, recurrence_interval }) {
    try {
      const row = {
        title,
        category: cat,
        start_time: start + (start.length === 5 ? ':00' : ''),
        end_time: end + (end.length === 5 ? ':00' : ''),
        date: is_recurring ? null : date,
        is_recurring: !!is_recurring
      };
      if (userEmail != null && userEmail !== '') row.user_email = userEmail;
      if (is_recurring && day_of_week != null) row.day_of_week = Number(day_of_week);
      if (is_recurring && (recurrence_interval === 1 || recurrence_interval === 2)) row.recurrence_interval = recurrence_interval;

      let result = await supabase
        .from('schedule_events')
        .insert(row)
        .select('id, title, category, start_time, end_time, date')
        .single();

      if (result.error && result.error.code === '42703') {
        delete row.user_email;
        if (row.recurrence_interval !== undefined) delete row.recurrence_interval;
        if (row.day_of_week !== undefined) delete row.day_of_week;
        result = await supabase
          .from('schedule_events')
          .insert(row)
          .select('id, title, category, start_time, end_time, date')
          .single();
      }
      if (result.error) {
        console.error('Schedule event insert error:', result.error.message, result.error.details);
        throw result.error;
      }
      return result.data;
    } catch (error) {
      console.error('Error creating schedule event:', error);
      return null;
    }
  },

  async updateScheduleEvent(id, { title, date, start, end, cat, is_recurring, day_of_week, recurrence_interval, recurrence_end_date }) {
    try {
      const payload = { title, category: cat };
      if (date != null) payload.date = date;
      if (start != null) payload.start_time = start.length === 5 ? start + ':00' : start;
      if (end != null) payload.end_time = end.length === 5 ? end + ':00' : end;
      if (is_recurring != null) payload.is_recurring = is_recurring;
      if (day_of_week != null) payload.day_of_week = day_of_week;
      if (recurrence_interval != null) payload.recurrence_interval = recurrence_interval;
      if (recurrence_end_date !== undefined) payload.recurrence_end_date = recurrence_end_date || null;

      const { data, error } = await supabase
        .from('schedule_events')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating schedule event:', error);
      return null;
    }
  },

  async deleteScheduleEvent(id) {
    try {
      const { error } = await supabase.from('schedule_events').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting schedule event:', error);
      return false;
    }
  }
};