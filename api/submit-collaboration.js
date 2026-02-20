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

// Send email via Resend
async function sendEmail(to, subject, html) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is not set. Skipping email send.');
        return;
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
        console.error(`Email send failed: ${error}`);
    } else {
        console.log(`Email sent successfully to ${to}`);
    }
}

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
        const { organization, contactName, email, phone, proposal, externalLink, image, ...dynamicAnswers } = req.body;

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
            createdAt: FieldValue.serverTimestamp(),
            ...dynamicAnswers // Capture all additional fields
        };

        const docRef = await db.collection('COLLABORATIONS').add(newCollab);

        // Send confirmation email to the applicant
        const emailHTML = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #000; color: #fff; border-radius: 16px; overflow: hidden; border: 2px solid #333;">
                <div style="background: #FFB22C; padding: 24px 32px; text-align: center;">
                    <h1 style="margin: 0; color: #000; font-size: 24px; font-weight: 900; letter-spacing: 1px;">E-CELL DYPIU</h1>
                    <p style="margin: 4px 0 0; color: #000; font-size: 14px; font-weight: 600;">Collaboration Application</p>
                </div>
                <div style="padding: 32px;">
                    <p style="color: #ccc; font-size: 15px; line-height: 1.6;">
                        Hi <strong style="color: #fff;">${contactName}</strong>,
                    </p>
                    <p style="color: #ccc; font-size: 15px; line-height: 1.6;">
                        Thank you for your application to collaborate with us! We have successfully received your request for <strong>${organization}</strong>.
                    </p>
                    <p style="color: #ccc; font-size: 15px; line-height: 1.6;">
                        You will receive an email with our response shortly. Our team is reviewing your proposal.
                    </p>
                    <div style="margin-top: 24px;">
                        <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.ecelldypiu.in'}/collaborations/status/${docRef.id}" style="display: inline-block; background: #FFB22C; color: #000; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">Track Status</a>
                    </div>
                </div>
                <div style="background: #111; padding: 16px 32px; text-align: center; border-top: 1px solid #333;">
                    <p style="color: #666; font-size: 12px; margin: 0;">
                        E-Cell Entrepreneurship Cell, DY Patil International University
                    </p>
                </div>
            </div>
        `;

        await sendEmail(email, 'Application Received - E-Cell DYPIU', emailHTML);

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
