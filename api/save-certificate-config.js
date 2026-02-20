// Vercel Serverless Function for Saving Certificate Config
// Falls back to local JSON file when Firebase is unavailable
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

let db = null;
let Timestamp = null;

try {
    const { initializeApp, getApps, cert } = await import('firebase-admin/app');
    const firestore = await import('firebase-admin/firestore');
    const { getFirestore } = firestore;
    Timestamp = firestore.Timestamp;

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
    console.warn('⚠️  Firebase not available for save-certificate-config, using local fallback');
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

function writeLocalConfigs(configs) {
    const filePath = getLocalConfigPath();
    fs.writeFileSync(filePath, JSON.stringify(configs, null, 2), 'utf-8');
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const authHeader = req.headers.authorization;
    const adminKey = process.env.ADMIN_API_KEY;
    if (!adminKey || authHeader !== `Bearer ${adminKey}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const {
            eventId,
            eventName,
            enabled,
            templateUrl,
            textFields,
            customFonts,
            attendeeCollection,
            eligibility
        } = req.body;

        if (!eventId || !eventName) {
            return res.status(400).json({ error: 'eventId and eventName are required' });
        }

        const configData = {
            eventId,
            eventName,
            enabled: enabled !== false,
            templateUrl: templateUrl || '',
            textFields: textFields || [],
            customFonts: customFonts || [],
            attendeeCollection: attendeeCollection || `events/${eventId}/attendees`,
            eligibility: eligibility || {},
            updatedAt: new Date().toISOString(),
        };

        let savedToFirebase = false;

        // Try Firebase first
        if (db) {
            try {
                const fbData = { ...configData };
                if (Timestamp) {
                    fbData.updatedAt = Timestamp.now();
                }

                const docRef = db.collection('certificateConfigs').doc(eventId);
                const existing = await docRef.get();

                if (existing.exists) {
                    await docRef.update(fbData);
                } else {
                    if (Timestamp) fbData.createdAt = Timestamp.now();
                    await docRef.set(fbData);
                }
                savedToFirebase = true;
                console.log('✅ Certificate config saved to Firebase for:', eventId);
            } catch (fbErr) {
                console.warn('Firebase write failed, using local fallback:', fbErr.message);
            }
        }

        // Always also save locally (as backup / for when Firebase is unavailable)
        if (!savedToFirebase) {
            const localConfigs = readLocalConfigs();
            localConfigs[eventId] = configData;
            writeLocalConfigs(localConfigs);
            console.log('✅ Certificate config saved locally for:', eventId);
        }

        return res.status(200).json({
            success: true,
            message: `Certificate config saved for ${eventName}${savedToFirebase ? ' (Firebase)' : ' (Local)'}`,
            config: configData
        });

    } catch (error) {
        console.error('Error saving certificate config:', error);
        return res.status(500).json({
            error: 'Failed to save certificate config',
            details: error.message
        });
    }
}
