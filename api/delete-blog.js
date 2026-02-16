// Vercel Serverless Function for Deleting Blogs
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin (only once)
if (!getApps().length) {
    initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

const db = getFirestore();

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Verify admin API key
    const authHeader = req.headers.authorization;
    const adminKey = process.env.ADMIN_API_KEY;

    if (!adminKey || authHeader !== `Bearer ${adminKey}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'Blog ID is required' });
        }

        // Delete the blog
        await db.collection('BLOGS').doc(id).delete();

        console.log('✅ Blog deleted:', id);

        return res.status(200).json({
            success: true,
            message: 'Blog deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting blog:', error);
        return res.status(500).json({
            error: 'Failed to delete blog',
            details: error.message
        });
    }
}
