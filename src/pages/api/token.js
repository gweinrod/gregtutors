import { verify } from 'jsonwebtoken';

export default async function handler(req, res) {
  
  //GET only
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  //Get authorization header
  const authHeader = req.headers.authorization;

  //Check for token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  //Extract token
  const token = authHeader.split(' ')[1];
  
  try {
    //Verify JWT
    const decoded = verify(token, process.env.JWT_SECRET);
    
    // TODO: Get user from database
    // const user = await db.query('SELECT id, name, email FROM users WHERE id = $1', [decoded.userId]);
    
    // TODO: Remove dummy data
    const user = {
      id: decoded.userId,
      name: decoded.name,
      email: decoded.email,
    };
    
    return res.status(200).json({ user });
  } catch (error) {
    console.error('Token validation error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
}
