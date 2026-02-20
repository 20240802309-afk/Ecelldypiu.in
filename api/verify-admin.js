// Vercel Serverless Function to Verify Admin API Key
export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Verify admin API key
    const authHeader = req.headers.authorization;
    const adminKey = process.env.ADMIN_API_KEY;

    if (!adminKey) {
        return res.status(500).json({ error: 'Admin key not configured on server' });
    }

    if (!authHeader || authHeader !== `Bearer ${adminKey}`) {
        return res.status(401).json({ 
            error: 'Unauthorized', 
            message: 'Invalid admin key' 
        });
    }

    return res.status(200).json({ 
        success: true, 
        message: 'Authenticated successfully' 
    });
}
