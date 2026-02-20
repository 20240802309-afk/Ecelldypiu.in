import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split('Bearer ')[1];
    if (token !== process.env.ADMIN_API_KEY) {
        return res.status(403).json({ error: 'Invalid admin key' });
    }

    try {
        const { questions } = req.body;

        if (!Array.isArray(questions)) {
            return res.status(400).json({ error: 'Invalid config format: questions must be an array' });
        }

        const docRef = db.collection('CONFIG').doc('collaborationQuestions');
        await docRef.set({
            questions,
            lastUpdatedAt: new Date(),
        }, { merge: true });

        return res.status(200).json({
            success: true,
            message: 'Dynamic collaboration questions updated successfully'
        });

    } catch (error) {
        console.error('Error updating dynamic questions:', error);
        return res.status(500).json({
            error: 'Failed to update dynamic questions',
            details: error.message
        });
    }
}
