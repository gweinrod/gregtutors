// This endpoint is no longer needed with Supabase auth
// But keeping it for backward compatibility during transition
export default async function handler(req, res) {
  return res.status(410).json({ 
    message: 'This endpoint has been deprecated. Please use Supabase authentication.' 
  });
}