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
        // With a fully dynamic form, we don't know the exact field names.
        // We will just accept the payload as is, except checking if it's empty.
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: 'Application data is required.' });
        }

        // We will try to find an email field to send the confirmation to
        let email = null;
        for (const [key, value] of Object.entries(req.body)) {
            if (key.toLowerCase().includes('email') && typeof value === 'string' && value.includes('@')) {
                email = value;
                break; // Found an email
            }
        }

        // Prepare the new collaboration object
        const newCollab = {
            ...req.body,
            status: 'pending',
            createdAt: FieldValue.serverTimestamp(),
        };

        const docRef = await db.collection('COLLABORATIONS').add(newCollab);

        // Send confirmation email to the applicant if we found an email
        if (email) {
            const emailHTML = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h2>Thank You for Your Application!</h2>
                    <p>Hello,</p>
                    <p>We have successfully received your collaboration application at E-Cell DYPIU.</p>
                    <p>Our team will review your proposal and get back to you soon. In the meantime, you can track the status of your application using the link below:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.ecelldypiu.in'}/collaborations/status/${docRef.id}" 
                           style="background-color: #fbbf24; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px;">
                            Track Application Status
                        </a>
                    </div>
                    <p>Application Reference ID: <strong>${docRef.id}</strong></p>
                    <p>Best Regards,<br>E-Cell DYPIU Team</p>
                </div>
            `;

            await sendEmail(email, 'Application Received - E-Cell DYPIU', emailHTML);
        } else {
            console.log('No email field found in dynamic submission, skipping confirmation email.');
        }

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
