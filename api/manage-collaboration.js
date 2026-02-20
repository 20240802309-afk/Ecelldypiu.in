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
    res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split('Bearer ')[1] !== process.env.ADMIN_API_KEY) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { id, action } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'Collaboration ID is required' });
        }

        const collabRef = db.collection('COLLABORATIONS').doc(id);

        if (req.method === 'DELETE') {
            await collabRef.delete();
            return res.status(200).json({ success: true, message: 'Collaboration deleted successfully' });
        }

        if (req.method === 'POST') {
            if (action === 'approve') {
                await collabRef.update({ status: 'approved' });
                return res.status(200).json({ success: true, message: 'Collaboration approved' });
            } else if (action === 'reject') {
                await collabRef.update({ status: 'rejected' });
                return res.status(200).json({ success: true, message: 'Collaboration rejected' });
            } else {
                return res.status(400).json({ error: 'Invalid action. Must be approve or reject.' });
            }
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Error managing collaboration:', error);
        return res.status(500).json({
            error: 'Failed to manage collaboration',
            details: error.message
        });
    }
}
