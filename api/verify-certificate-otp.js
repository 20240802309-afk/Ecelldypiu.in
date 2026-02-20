// Vercel Serverless Function for Verifying Certificate OTP
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

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

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { eventId, attendeeId, otp } = req.body;

        if (!eventId || !attendeeId || !otp) {
            return res.status(400).json({ error: 'eventId, attendeeId, and otp are required' });
        }

        // Look up the stored OTP
        const otpDocId = `${eventId}_${attendeeId}`;
        const otpDocRef = db.collection('certificateOTPs').doc(otpDocId);
        const otpDoc = await otpDocRef.get();

        if (!otpDoc.exists) {
            return res.status(404).json({ error: 'No OTP found. Please request a new one.' });
        }

        const otpData = otpDoc.data();

        // Check if already verified
        if (otpData.verified) {
            // Still allow re-verification — just fetch and return attendee data
        }

        // Check OTP match
        if (otpData.otp !== otp) {
            return res.status(400).json({ error: 'Invalid OTP. Please check and try again.' });
        }

        // Check expiry
        const expiresAt = otpData.expiresAt?.toDate?.() || new Date(otpData.expiresAt?._seconds * 1000);
        if (new Date() > expiresAt) {
            return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
        }

        // Mark as verified
        await otpDocRef.update({ verified: true, verifiedAt: Timestamp.now() });

        // Fetch full attendee data
        const configDoc = await db.collection('certificateConfigs').doc(eventId).get();
        const config = configDoc.data();
        const attendeeCollection = config.attendeeCollection || `events/${eventId}/attendees`;

        const attendeeDoc = await db.collection(attendeeCollection).doc(attendeeId).get();
        if (!attendeeDoc.exists) {
            return res.status(404).json({ error: 'Attendee record not found' });
        }

        const attendeeData = attendeeDoc.data();

        console.log('✅ OTP verified for:', attendeeData.email || attendeeId, 'Event:', eventId);

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
        return res.status(500).json({
            error: 'Failed to verify OTP',
            details: error.message
        });
    }
}
