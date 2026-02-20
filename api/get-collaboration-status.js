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
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ error: 'Collaboration ID is required' });
        }

        const collabRef = db.collection('COLLABORATIONS').doc(id);
        const docSnap = await collabRef.get();

        if (!docSnap.exists) {
            return res.status(404).json({ error: 'Application not found' });
        }

        const data = docSnap.data();

        // Return only safe fields
        return res.status(200).json({
            success: true,
            application: {
                id: docSnap.id,
                organization: data.organization,
                contactName: data.contactName,
                status: data.status,
                createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null
            }
        });
    } catch (error) {
        console.error('Error fetching collaboration status:', error);
        return res.status(500).json({
            error: 'Failed to fetch status',
            details: error.message
        });
    }
}
