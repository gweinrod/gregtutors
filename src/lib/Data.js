import { parseCookies } from 'nookies';

//Database servicing library, calls endpoint and hydrates pages
class Data {
  constructor() {
    // TODO: configure all API urls
    this.apiUrl = process.env.API_URL;
  }

  //Fetch Reviews
  //@param {number} count - Number of reviews to fetch
  //@returns {Promise<Array>} - Array of reviews
  async getReviews(count = 3) {
    try {
      const response = await fetch(
        `${this.apiUrl}/api/getreviews?number=${count}`
      );
      
      if (!response.ok) {
        console.error('Error fetching reviews:', response.statusText);
        return [];
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  }
  
  //Fetch Quotes
  //@param {number} count - Number of quotes to fetch
  //@returns {Promise<Array>} - Array of quotes
  async getQuotes(count = 3) {
    try {
      const response = await fetch(
        `${this.apiUrl}/api/getquotes?number=${count}`
      );
      
      if (!response.ok) {
        console.error('Error fetching quotes:', response.statusText);
        return [];
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching quotes:', error);
      return [];
    }
  }
  
  //Fetch schedule
  //@param {Object} user - User object
  //@param {Object} context - Next.js context object
  //@returns {Promise<Object|null>} - Schedule data or null
  async getSchedule(user, context) {
    if (!user || !user.id) return null;
    
    try {
      const { token } = parseCookies(context);
      
      if (!token) return null;
      
      const response = await fetch(
        `${this.apiUrl}/api/schedule?userId=${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        console.error('Error fetching scheduler data:', response.statusText);
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching scheduler data:', error);
      return null;
    }
  }
  
 //Fetch Home
 //@param {Object} context - Next.js context object
 //@param {Object} user - User object from auth
 //@returns {Promise<Object>} - All data for the home page
  async getHome(context, user) {
    // Fetch reviews and quotes in parallel
    const [reviews, quotes] = await Promise.all([
      this.getReviews(3),
      this.getQuotes(3)
    ]);
    
    //Fetch Schedule if authenticated
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
