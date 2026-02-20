import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

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
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { organization, contactName, email, phone, proposal, externalLink, image } = req.body;

        if (!organization || !contactName || !email || !proposal) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newCollab = {
            organization,
            contactName,
            email,
            phone: phone || '',
            proposal,
            externalLink: externalLink || '',
            image: image || '',
            status: 'pending', // Pending admin approval
            createdAt: FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('COLLABORATIONS').add(newCollab);

        return res.status(200).json({
            success: true,
            message: 'Collaboration application submitted successfully',
            collaboration: {
                id: docRef.id,
                ...newCollab
            }
        });

    } catch (error) {
        console.error('Error submitting collaboration:', error);
        return res.status(500).json({
            error: 'Failed to submit collaboration',
            details: error.message
        });
    }
}
