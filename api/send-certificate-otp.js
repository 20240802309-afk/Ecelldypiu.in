// Vercel Serverless Function for Sending Certificate OTP
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

// Generate 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send email via Resend
async function sendEmail(to, subject, html) {
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

// Mask email for privacy
function maskEmail(email) {
    const [local, domain] = email.split('@');
    const maskedLocal = local.length > 3
        ? local.slice(0, 2) + '*'.repeat(local.length - 3) + local.slice(-1)
        : local[0] + '*'.repeat(local.length - 1);
    return `${maskedLocal}@${domain}`;
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { eventId, identifier } = req.body;

        if (!eventId || !identifier) {
            return res.status(400).json({ error: 'eventId and identifier (email or name) are required' });
        }

        // Get certificate config to find attendee collection
        const configDoc = await db.collection('certificateConfigs').doc(eventId).get();
        if (!configDoc.exists || !configDoc.data().enabled) {
            return res.status(404).json({ error: 'Certificate not available for this event' });
        }

        const config = configDoc.data();
        const attendeeCollection = config.attendeeCollection || `events/${eventId}/attendees`;

        // Search for attendee by email or name
        const collectionRef = db.collection(attendeeCollection);
        let attendeeDoc = null;
        let attendeeData = null;

        // Try email first
        const emailQuery = await collectionRef.where('email', '==', identifier.toLowerCase().trim()).limit(1).get();
        if (!emailQuery.empty) {
            attendeeDoc = emailQuery.docs[0];
            attendeeData = attendeeDoc.data();
        }

        // Try name if email didn't match
        if (!attendeeData) {
            const nameQuery = await collectionRef.where('name', '==', identifier.trim()).limit(1).get();
            if (!nameQuery.empty) {
                attendeeDoc = nameQuery.docs[0];
                attendeeData = nameQuery.docs[0].data();
            }
        }

        // Try case-insensitive name search
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

        if (!attendeeData || !attendeeDoc) {
            return res.status(404).json({
                error: 'No attendee found with this email or name. Please check your details and try again.'
            });
        }

        // Check if attendee has an email to send OTP
        if (!attendeeData.email) {
            return res.status(400).json({
                error: 'No email address found for this attendee. Please contact the organizers.'
            });
        }

        // Generate OTP
        const otp = generateOTP();
        const expiresAt = Timestamp.fromDate(new Date(Date.now() + 10 * 60 * 1000)); // 10 min expiry

        // Store OTP in Firestore
        const otpDocId = `${eventId}_${attendeeDoc.id}`;
        await db.collection('certificateOTPs').doc(otpDocId).set({
            eventId,
            attendeeId: attendeeDoc.id,
            otp,
            expiresAt,
            verified: false,
            createdAt: Timestamp.now(),
        });

        // Send OTP email
        const emailHTML = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #000; color: #fff; border-radius: 16px; overflow: hidden; border: 2px solid #333;">
                <div style="background: #FFB22C; padding: 24px 32px; text-align: center;">
                    <h1 style="margin: 0; color: #000; font-size: 24px; font-weight: 900; letter-spacing: 1px;">E-CELL DYPIU</h1>
                    <p style="margin: 4px 0 0; color: #000; font-size: 14px; font-weight: 600;">Certificate Verification</p>
                </div>
                <div style="padding: 32px;">
                    <p style="color: #ccc; font-size: 15px; line-height: 1.6;">
                        Hi <strong style="color: #fff;">${attendeeData.name}</strong>,
                    </p>
                    <p style="color: #ccc; font-size: 15px; line-height: 1.6;">
                        Your OTP for certificate download for <strong style="color: #FFB22C;">${config.eventName}</strong> is:
                    </p>
                    <div style="text-align: center; margin: 24px 0;">
                        <div style="display: inline-block; background: #111; border: 2px solid #FFB22C; border-radius: 12px; padding: 16px 40px;">
                            <span style="font-size: 36px; font-weight: 900; letter-spacing: 12px; color: #FFB22C;">${otp}</span>
                        </div>
                    </div>
                    <p style="color: #888; font-size: 13px; text-align: center;">
                        This code expires in <strong>10 minutes</strong>. Do not share it with anyone.
                    </p>
                </div>
                <div style="background: #111; padding: 16px 32px; text-align: center; border-top: 1px solid #333;">
                    <p style="color: #666; font-size: 12px; margin: 0;">
                        E-Cell Entrepreneurship Cell, DY Patil International University
                    </p>
                </div>
            </div>
        `;

        await sendEmail(
            attendeeData.email,
            `Your Certificate OTP - ${config.eventName}`,
            emailHTML
        );

        console.log('✅ OTP sent for:', attendeeData.email, 'Event:', eventId);

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
        return res.status(500).json({
            error: 'Failed to send OTP',
            details: error.message
        });
    }
}
