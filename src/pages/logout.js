export default async function handler(req, res) {
  
  //Post only
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // TODO: Further service side logout logic, winding down, clearing context
  return res.status(200).json({ success: true });
  
}
