import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp as FirestoreTimestamp } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

let db = null;
let Timestamp = FirestoreTimestamp;

try {
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
    console.warn('⚠️  Firebase not available for certificate API, using local fallback');
}

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

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendEmail(to, subject, html) {
    if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY is not set');
    }
    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
            from: process.env.EMAIL_FROM || 'E-Cell DYPIU <noreply@ecelldypiu.in>',
            to: [to],
            subject,
            html,
        }),
    });

    if (!res.ok) {
        const error = await res.text();
        throw new Error(`Email send failed: ${error}`);
    }
    return res.json();
}

function maskEmail(email) {
    const [local, domain] = email.split('@');
    const maskedLocal = local.length > 3
        ? local.slice(0, 2) + '*'.repeat(local.length - 3) + local.slice(-1)
        : local[0] + '*'.repeat(local.length - 1);
    return `${maskedLocal}@${domain}`;
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const url = new URL(req.url, 'http://localhost');
    const actionQuery = req.query?.action || url.searchParams.get('action');

    if (req.method === 'GET') {
        if (actionQuery === 'templates') {
            return await handleListTemplates(req, res);
        }
        return await handleGetConfig(req, res);
    }

    if (req.method === 'POST') {
        // We might accept action in body or query
        const action = actionQuery || req.body?.action;

        if (action === 'save-config') {
            return await handleSaveConfig(req, res);
        } else if (action === 'send-otp') {
            return await handleSendOtp(req, res);
        } else if (action === 'verify-otp') {
            return await handleVerifyOtp(req, res);
        } else if (action === 'upload-template') {
            return await handleUploadTemplate(req, res);
        }
        return res.status(400).json({ error: 'Valid action parameter is required for POST' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}

async function handleGetConfig(req, res) {
    try {
        const url = new URL(req.url, 'http://localhost');
        const eventId = req.query?.eventId || url.searchParams.get('eventId');
        const isAdmin = req.query?.admin === 'true' || url.searchParams.get('admin') === 'true';

        if (!eventId) return res.status(400).json({ error: 'eventId is required' });

        let config = null;

        if (db) {
            try {
                const docRef = db.collection('certificateConfigs').doc(eventId);
                const doc = await docRef.get();
                if (doc.exists) config = doc.data();
            } catch (fbErr) {
                console.warn('Firebase read failed, trying local fallback:', fbErr.message);
            }
        }

        if (!config) {
            const localConfigs = readLocalConfigs();
            config = localConfigs[eventId] || null;
        }

        if (!config) return res.status(404).json({ error: 'No certificate config found for this event' });
        if (!config.enabled) return res.status(404).json({ error: 'Certificates are not enabled for this event' });

        const publicConfig = {
            eventId: config.eventId,
            eventName: config.eventName,
            enabled: config.enabled,
            templateUrl: config.templateUrl,
            textFields: config.textFields,
            customFonts: config.customFonts,
        };

        if (isAdmin) {
            publicConfig.eligibility = config.eligibility || {};
            publicConfig.attendeeCollection = config.attendeeCollection || '';
        }

        return res.status(200).json({ config: publicConfig });
    } catch (error) {
        console.error('Error getting config:', error);
        return res.status(500).json({ error: 'Failed to get certificate config', details: error.message });
    }
}

async function handleListTemplates(req, res) {
    try {
        let certsDir;
        if (typeof __dirname !== 'undefined') {
            certsDir = path.resolve(__dirname, '..', 'public', 'certificates');
        } else {
            const __dir = path.dirname(fileURLToPath(import.meta.url));
            certsDir = path.resolve(__dir, '..', 'public', 'certificates');
        }

        if (!fs.existsSync(certsDir)) return res.status(200).json({ templates: [] });

        const files = fs.readdirSync(certsDir)
            .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f))
            .map(f => ({
                name: f.replace(/\.(png|jpg|jpeg|webp)$/i, '').replace(/[-_]/g, ' '),
                filename: f,
                url: `/certificates/${f}`,
            }));

        return res.status(200).json({ templates: files });
    } catch (error) {
        console.error('Error listing templates:', error);
        return res.status(500).json({ error: 'Failed to list templates', details: error.message });
    }
}

async function handleSaveConfig(req, res) {
    const authHeader = req.headers.authorization;
    const adminKey = process.env.ADMIN_API_KEY;
    if (!adminKey || authHeader !== `Bearer ${adminKey}`) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const { eventId, eventName, enabled, templateUrl, textFields, customFonts, attendeeCollection, eligibility } = req.body;
        if (!eventId || !eventName) return res.status(400).json({ error: 'eventId and eventName are required' });

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

        if (db) {
            try {
                const fbData = { ...configData };
                if (Timestamp) fbData.updatedAt = Timestamp.now();
                const docRef = db.collection('certificateConfigs').doc(eventId);
                const existing = await docRef.get();
                if (existing.exists) {
                    await docRef.update(fbData);
                } else {
                    if (Timestamp) fbData.createdAt = Timestamp.now();
                    await docRef.set(fbData);
                }
                savedToFirebase = true;
            } catch (fbErr) {
                console.warn('Firebase write failed, using local fallback:', fbErr.message);
            }
        }

        if (!savedToFirebase) {
            const localConfigs = readLocalConfigs();
            localConfigs[eventId] = configData;
            writeLocalConfigs(localConfigs);
        }

        return res.status(200).json({
            success: true,
            message: `Certificate config saved for ${eventName} ${savedToFirebase ? '(Firebase)' : '(Local)'}`,
            config: configData
        });
    } catch (error) {
        console.error('Error saving config:', error);
        return res.status(500).json({ error: 'Failed to save certificate config', details: error.message });
    }
}

async function handleSendOtp(req, res) {
    try {
        const { eventId, identifier } = req.body;
        if (!eventId || !identifier) return res.status(400).json({ error: 'eventId and identifier are required' });

        if (!db) return res.status(500).json({ error: 'Database connection not available' });

        const configDoc = await db.collection('certificateConfigs').doc(eventId).get();
        if (!configDoc.exists || !configDoc.data().enabled) return res.status(404).json({ error: 'Certificate not available for this event' });

        const config = configDoc.data();
        const attendeeCollection = config.attendeeCollection || `events/${eventId}/attendees`;
        const collectionRef = db.collection(attendeeCollection);

        let attendeeDoc = null, attendeeData = null;

        const emailQuery = await collectionRef.where('email', '==', identifier.toLowerCase().trim()).limit(1).get();
        if (!emailQuery.empty) {
            attendeeDoc = emailQuery.docs[0];
            attendeeData = attendeeDoc.data();
        }

        if (!attendeeData) {
            const nameQuery = await collectionRef.where('name', '==', identifier.trim()).limit(1).get();
            if (!nameQuery.empty) {
                attendeeDoc = nameQuery.docs[0];
                attendeeData = nameQuery.docs[0].data();
            }
        }

        if (!attendeeData) {
            const allDocs = await collectionRef.get();
            for (const doc of allDocs.docs) {
                const data = doc.data();
                if (data.name && data.name.toLowerCase().trim() === identifier.toLowerCase().trim()) {
                    attendeeDoc = doc;
                    attendeeData = data;
                    break;
                }
            }
        }

        if (!attendeeData || !attendeeDoc) return res.status(404).json({ error: 'No attendee found. Check your details.' });
        if (!attendeeData.email) return res.status(400).json({ error: 'No email address found for this attendee' });

        const otp = generateOTP();
        const expiresAt = Timestamp.fromDate(new Date(Date.now() + 10 * 60 * 1000));
        const otpDocId = `${eventId}_${attendeeDoc.id}`;

        await db.collection('certificateOTPs').doc(otpDocId).set({
            eventId,
            attendeeId: attendeeDoc.id,
            otp,
            expiresAt,
            verified: false,
            createdAt: Timestamp.now(),
        });

        const emailHTML = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #000; color: #fff; border-radius: 16px; overflow: hidden; border: 2px solid #333;">
                <div style="background: #FFB22C; padding: 24px 32px; text-align: center;">
                    <h1 style="margin: 0; color: #000; font-size: 24px; font-weight: 900; letter-spacing: 1px;">E-CELL DYPIU</h1>
                    <p style="margin: 4px 0 0; color: #000; font-size: 14px; font-weight: 600;">Certificate Verification</p>
                </div>
                <div style="padding: 32px;">
                    <p style="color: #ccc; font-size: 15px; line-height: 1.6;">Hi <strong style="color: #fff;">${attendeeData.name}</strong>,</p>
                    <p style="color: #ccc; font-size: 15px; line-height: 1.6;">Your OTP for certificate download for <strong style="color: #FFB22C;">${config.eventName}</strong> is:</p>
                    <div style="text-align: center; margin: 24px 0;">
                        <div style="display: inline-block; background: #111; border: 2px solid #FFB22C; border-radius: 12px; padding: 16px 40px;">
                            <span style="font-size: 36px; font-weight: 900; letter-spacing: 12px; color: #FFB22C;">${otp}</span>
                        </div>
                    </div>
                    <p style="color: #888; font-size: 13px; text-align: center;">This code expires in <strong>10 minutes</strong>.</p>
                </div>
            </div>
        `;

        await sendEmail(attendeeData.email, `Your Certificate OTP - ${config.eventName}`, emailHTML);

        return res.status(200).json({
            success: true,
            message: 'OTP sent to your email',
            attendeeId: attendeeDoc.id,
            attendee: {
                name: attendeeData.name,
                email: maskEmail(attendeeData.email),
                team: attendeeData.team || attendeeData.teamName || null,
                college: attendeeData.college || null,
            }
        });
    } catch (error) {
        console.error('Error sending certificate OTP:', error);
        return res.status(500).json({ error: 'Failed to send OTP', details: error.message });
    }
}

async function handleVerifyOtp(req, res) {
    try {
        const { eventId, attendeeId, otp } = req.body;
        if (!eventId || !attendeeId || !otp) return res.status(400).json({ error: 'eventId, attendeeId, and otp required' });
        if (!db) return res.status(500).json({ error: 'Database connection not available' });

        const otpDocId = `${eventId}_${attendeeId}`;
        const otpDocRef = db.collection('certificateOTPs').doc(otpDocId);
        const otpDoc = await otpDocRef.get();

        if (!otpDoc.exists) return res.status(404).json({ error: 'No OTP found' });
        const otpData = otpDoc.data();

        if (otpData.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });

        const expiresAt = otpData.expiresAt?.toDate?.() || new Date(otpData.expiresAt?._seconds * 1000);
        if (new Date() > expiresAt) return res.status(400).json({ error: 'OTP has expired' });

        await otpDocRef.update({ verified: true, verifiedAt: Timestamp.now() });

        const configDoc = await db.collection('certificateConfigs').doc(eventId).get();
        const config = configDoc.data();
        const attendeeCollection = config.attendeeCollection || `events/${eventId}/attendees`;
        const attendeeDoc = await db.collection(attendeeCollection).doc(attendeeId).get();

        if (!attendeeDoc.exists) return res.status(404).json({ error: 'Attendee record not found' });
        const attendeeData = attendeeDoc.data();

        return res.status(200).json({
            verified: true,
            attendee: {
                name: attendeeData.name || '',
                email: attendeeData.email || '',
                team: attendeeData.team || attendeeData.teamName || '',
                college: attendeeData.college || '',
                phone: attendeeData.phone || '',
                role: attendeeData.role || '',
            }
        });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return res.status(500).json({ error: 'Failed to verify OTP', details: error.message });
    }
}

async function handleUploadTemplate(req, res) {
    const authHeader = req.headers.authorization;
    const adminKey = process.env.ADMIN_API_KEY;
    if (!adminKey || authHeader !== `Bearer ${adminKey}`) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const { filename, imageData } = req.body;
        if (!filename || !imageData) return res.status(400).json({ error: 'filename and imageData required' });

        const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase();
        if (!/\.(png|jpg|jpeg|webp)$/i.test(safeName)) return res.status(400).json({ error: 'File must be a valid image format' });

        let certsDir;
        if (typeof __dirname !== 'undefined') {
            certsDir = path.resolve(__dirname, '..', 'public', 'certificates');
        } else {
            const __dir = path.dirname(fileURLToPath(import.meta.url));
            certsDir = path.resolve(__dir, '..', 'public', 'certificates');
        }

        if (!fs.existsSync(certsDir)) fs.mkdirSync(certsDir, { recursive: true });

        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        fs.writeFileSync(path.join(certsDir, safeName), buffer);

        return res.status(200).json({
            success: true,
            url: `/certificates/${safeName}`,
            filename: safeName,
            message: `Template uploaded successfully`
        });
    } catch (error) {
        console.error('Error uploading template:', error);
        return res.status(500).json({ error: 'Failed to upload template', details: error.message });
    }
}
