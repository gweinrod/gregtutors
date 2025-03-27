import { sign } from 'jsonwebtoken';

//Login logic, calls validation microservice (is user in our db?) and leak detection from reCAPTCHA
export default async function handler(req, res) {
  
  // Post only logic
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Get credentials from request body
  const { email, password } = req.body;
  
  // Require both fields
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  try {
    // Check if credentials have been leaked
    let passwordLeaked = false;
    try {
      const pldResponse = await fetch('http://localhost:8080/createAssessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: email,
          password
        })
      });

      if (pldResponse.ok) {
        const pldData = await pldResponse.json();
        passwordLeaked = (pldData.leakedStatus === 'LEAKED');
      }
    } catch (pldError) {
      console.error('Error checking credentials with PLD service:', pldError);
    }
    
    // TODO: Password validation microservice, remove dummy case
    const isValid = email === 'test@example.com' && password === 'password123';
    
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // TODO: Remove dummy data here
    const user = {
      id: '123',
      name: 'Test User',
      email: 'test@example.com'
    };
    
    // Tokenize user data to a JWT
    const token = sign(
      { 
        userId: user.id,
        name: user.name,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '14d' }
    );
    
    return res.status(200).json({
      user,
      token,
      warning: passwordLeaked ? 'Your password appears in a data breach. For security, we recommend changing your password.' : null
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'An error occurred during login' });
  }
}
