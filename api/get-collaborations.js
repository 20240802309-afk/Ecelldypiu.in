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
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const authHeader = req.headers.authorization;
        const isAdminRequest = authHeader && authHeader.startsWith('Bearer ') && authHeader.split('Bearer ')[1] === process.env.ADMIN_API_KEY;

        let query = db.collection('COLLABORATIONS');

        // If not admin, only fetch approved collaborations
        if (!isAdminRequest) {
            query = query.where('status', '==', 'approved');
        }

        query = query.orderBy('createdAt', 'desc');

        let snapshot;
        try {
            snapshot = await query.get();
        } catch (indexError) {
            console.log('Index error, using fallback:', indexError.message);
            snapshot = await db.collection('COLLABORATIONS').get();
            let allItems = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                if (isAdminRequest || data.status === 'approved') {
                    allItems.push({
                        id: doc.id,
                        ...data
                    });
                }
            });
            allItems.sort((a, b) => {
                const aTime = a.createdAt?.toMillis?.() || 0;
                const bTime = b.createdAt?.toMillis?.() || 0;
                return bTime - aTime;
            });
            return res.status(200).json({
                success: true,
                collaborations: allItems,
                count: allItems.length
            });
        }

        const collaborations = [];
        snapshot.forEach(doc => {
            collaborations.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return res.status(200).json({
            success: true,
            collaborations,
            count: collaborations.length
        });
    } catch (error) {
        console.error('Error fetching collaborations:', error);
        return res.status(500).json({
            error: 'Failed to fetch collaborations',
            details: error.message
        });
    }
}
