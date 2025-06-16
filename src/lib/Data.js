import { dataService } from './supabase';

// Database servicing library, now using Supabase
class Data {
  constructor() {
    // Using Supabase instead of external API
  }

  // Fetch Reviews
  // @param {number} count - Number of reviews to fetch
  // @returns {Promise<Array>} - Array of reviews
  async getReviews(count = 3) {
    return await dataService.getReviews(count);
  }
  
  // Fetch Quotes
  // @param {number} count - Number of quotes to fetch
  // @returns {Promise<Array>} - Array of quotes
  async getQuotes(count = 3) {
    return await dataService.getQuotes(count);
  }
  
  // Fetch schedule
  // @param {Object} user - User object
  // @param {Object} context - Next.js context object
  // @returns {Promise<Object|null>} - Schedule data or null
  async getSchedule(user, context) {
    if (!user || !user.id) return null;
    
    try {
      const hasAccess = await dataService.getScheduleAccess(user.id);
      
      if (hasAccess) {
        return {
          message: "You have access to schedule sessions.",
          calendarUrl: process.env.NEXT_PUBLIC_CALENDAR_URL || "https://calendar.google.com/",
          paymentUrl: process.env.NEXT_PUBLIC_PAYMENT_URL || "https://venmo.com/"
        };
      } else {
        return {
          message: "You don't currently have scheduling access. Please use the contact links for more information."
        };
      }
    } catch (error) {
      console.error('Error fetching scheduler data:', error);
      return null;
    }
  }
  
  // Fetch Home
  // @param {Object} context - Next.js context object
  // @param {Object} user - User object from auth
  // @returns {Promise<Object>} - All data for the home page
  async getHome(context, user) {
    // Fetch reviews and quotes in parallel
    const [reviews, quotes] = await Promise.all([
      this.getReviews(3),
      this.getQuotes(3)
    ]);
    
    // Fetch Schedule if authenticated
    const schedule = user ? await this.getSchedule(user, context) : null;
    
    return {
      reviews,
      quotes,
      schedule
    };
  }
}

const api = new Data();

export default { api };