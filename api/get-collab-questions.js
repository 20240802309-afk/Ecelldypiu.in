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
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const docRef = db.collection('CONFIG').doc('collaborationQuestions');
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            return res.status(200).json({ success: true, questions: docSnap.data().questions || [] });
        } else {
            // Return empty array if no config exists yet
            return res.status(200).json({ success: true, questions: [] });
        }
    } catch (error) {
        console.error('Error fetching dynamic questions:', error);
        return res.status(500).json({
            error: 'Failed to fetch collaboration form questions',
            details: error.message
        });
    }
}
