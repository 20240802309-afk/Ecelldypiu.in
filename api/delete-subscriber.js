// Vercel Serverless Function to Delete a Subscriber
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin (only once)
const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

if (!getApps().length) {
    initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey,
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

    // Verify admin API key for security
    const authHeader = req.headers.authorization;
    const adminKey = process.env.ADMIN_API_KEY;

    if (!adminKey || authHeader !== `Bearer ${adminKey}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { id } = req.body;

        // Validation
        if (!id) {
            return res.status(400).json({ error: 'Subscriber ID is required' });
        }

        // Check if subscriber exists
        const subscriberRef = db.collection('SUBSCRIPTION_REQUESTS').doc(id);
        const subscriber = await subscriberRef.get();

        if (!subscriber.exists) {
            return res.status(404).json({ error: 'Subscriber not found' });
        }

        // Delete subscriber
        await subscriberRef.delete();

        return res.status(200).json({
            success: true,
            message: 'Subscriber deleted successfully',
            deletedId: id
        });

    } catch (error) {
        console.error('Delete subscriber error:', error);
        return res.status(500).json({
            error: 'Failed to delete subscriber',
            details: error.message
        });
    }
}
