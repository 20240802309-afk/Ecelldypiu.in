// Vercel Serverless Function to Add a Subscriber
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
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Verify admin API key for security
    const authHeader = req.headers.authorization;
    const adminKey = process.env.ADMIN_API_KEY;

    if (!adminKey || authHeader !== `Bearer ${adminKey}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { name, email, phone, college } = req.body;

        // Validation
        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        // Check if email already exists
        const existingSubscriber = await db.collection('SUBSCRIPTION_REQUESTS')
            .where('email', '==', email.toLowerCase().trim())
            .get();

        if (!existingSubscriber.empty) {
            return res.status(400).json({ error: 'Email already subscribed' });
        }

        // Add subscriber to Firestore
        const subscriberData = {
            name: name.trim(),
            email: email.toLowerCase().trim(),
            phone: phone?.trim() || '',
            college: college?.trim() || '',
            subscribedAt: new Date(),
            source: 'admin-portal'
        };

        const docRef = await db.collection('SUBSCRIPTION_REQUESTS').add(subscriberData);

        return res.status(200).json({
            success: true,
            message: 'Subscriber added successfully',
            subscriber: {
                id: docRef.id,
                ...subscriberData
            }
        });

    } catch (error) {
        console.error('Add subscriber error:', error);
        return res.status(500).json({
            error: 'Failed to add subscriber',
            details: error.message
        });
    }
}
