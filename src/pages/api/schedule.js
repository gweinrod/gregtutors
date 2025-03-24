import { verify } from 'jsonwebtoken';

export default async function handler(req, res) {
  
  //GET only
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  //Get header
  const authHeader = req.headers.authorization;

  //Check token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  //Get token, user
  const token = authHeader.split(' ')[1];
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }
  
  try {
    //Verify JWT
    const decoded = verify(token, process.env.JWT_SECRET);
    
    //Verify user
    if (decoded.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    // TODO: get schedule/access
    // const schedulerAccess = await db.query(
    //   'SELECT has_access FROM user_scheduler WHERE user_id = $1',
    //   [userId]
    // );
    
    //Return the user's schedule if one exists
    if (userId === '123') { // TODO: Remove dummy case
      return res.status(200).json({
        message: "You have access to schedule sessions.",
        calendarUrl: process.env.CALENDAR_URL || "https://calendar.google.com/",
        paymentUrl: process.env.PAYMENT_URL || "https://venmo.com/"
      });
    } else {
      return res.status(200).json({
        message: "You don't currently have scheduling access. Please use the contact links for more information."
      });
    }
  } catch (error) {
    console.error('Schedule access error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
}
