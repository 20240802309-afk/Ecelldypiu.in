// Vercel Serverless Function for Getting Certificate Config
// Falls back to local JSON file when Firebase is unavailable
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

let db = null;

try {
    const { initializeApp, getApps, cert } = await import('firebase-admin/app');
    const { getFirestore } = await import('firebase-admin/firestore');

    const privateKey = process.env.FIREBASE_PRIVATE_KEY
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        : undefined;

    if (privateKey && privateKey.length > 100 && !getApps().length) {
        initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey,
            }),
        });
    }

    if (getApps().length) {
        db = getFirestore();
    }
} catch (e) {
    console.warn('⚠️  Firebase not available for get-certificate-config, using local fallback');
}

// Local JSON file path for fallback
function getLocalConfigPath() {
    const __dir = typeof __dirname !== 'undefined'
        ? __dirname
        : path.dirname(fileURLToPath(import.meta.url));
    return path.resolve(__dir, '..', 'certificate-configs.json');
}

function readLocalConfigs() {
    const filePath = getLocalConfigPath();
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    return {};
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const url = new URL(req.url, 'http://localhost');
        const eventId = req.query?.eventId || url.searchParams.get('eventId');
        const isAdmin = req.query?.admin === 'true' || url.searchParams.get('admin') === 'true';

        if (!eventId) {
            return res.status(400).json({ error: 'eventId is required' });
        }

        let config = null;

        // Try Firebase first
        if (db) {
            try {
                const docRef = db.collection('certificateConfigs').doc(eventId);
                const doc = await docRef.get();
                if (doc.exists) {
                    config = doc.data();
                }
            } catch (fbErr) {
                console.warn('Firebase read failed, trying local fallback:', fbErr.message);
            }
        }

        // Fallback to local JSON
        if (!config) {
            const localConfigs = readLocalConfigs();
            config = localConfigs[eventId] || null;
        }

        if (!config) {
            return res.status(404).json({ error: 'No certificate config found for this event' });
        }

        if (!config.enabled) {
            return res.status(404).json({ error: 'Certificates are not enabled for this event' });
        }

        const publicConfig = {
            eventId: config.eventId,
            eventName: config.eventName,
            enabled: config.enabled,
            templateUrl: config.templateUrl,
            textFields: config.textFields,
            customFonts: config.customFonts,
        };

        // Admin requests get full config including eligibility
        if (isAdmin) {
            publicConfig.eligibility = config.eligibility || {};
            publicConfig.attendeeCollection = config.attendeeCollection || '';
        }

        return res.status(200).json({ config: publicConfig });

    } catch (error) {
        console.error('Error getting certificate config:', error);
        return res.status(500).json({
            error: 'Failed to get certificate config',
            details: error.message
        });
    }
}
