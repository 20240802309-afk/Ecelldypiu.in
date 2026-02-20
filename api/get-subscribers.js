// Vercel Serverless Function to fetch Newsletter Subscribers
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
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Auth check
    const authHeader = req.headers.authorization;
    const adminKey = process.env.ADMIN_API_KEY;

    if (!adminKey || authHeader !== `Bearer ${adminKey}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const subscribersSnapshot = await db.collection('SUBSCRIPTION_REQUESTS').get();

        if (subscribersSnapshot.empty) {
            return res.status(200).json({
                success: true,
                subscribers: [],
                total: 0
            });
        }

        const subscribers = [];
        subscribersSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.email) {
                subscribers.push({
                    id: doc.id,
                    name: data.name || 'Unknown',
                    email: data.email,
                    phone: data.phone || data.mobile || '',
                    college: data.college || data.institution || '',
                    subscribedAt: data.createdAt || data.timestamp || null
                });
            }
        });

        return res.status(200).json({
            success: true,
            subscribers,
            total: subscribers.length
        });

    } catch (error) {
        console.error('Error fetching subscribers:', error);
        return res.status(500).json({
            error: 'Failed to fetch subscribers',
            details: error.message
        });
    }
}
