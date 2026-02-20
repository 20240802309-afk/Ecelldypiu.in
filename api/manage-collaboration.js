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
            const docSnap = await collabRef.get();
            if (!docSnap.exists) {
                return res.status(404).json({ error: 'Collaboration request not found' });
            }
            const collabData = docSnap.data();

            // Attempt to find dynamic email, name, and organization
            let recipientEmail = collabData.email;
            let recipientName = collabData.contactName || 'Applicant';
            let orgName = collabData.organization || 'Your Organization';

            if (!recipientEmail) {
                for (const [key, value] of Object.entries(collabData)) {
                    if (key.toLowerCase().includes('email') && typeof value === 'string' && value.includes('@')) {
                        recipientEmail = value;
                    }
                    if (key.toLowerCase().includes('name') && !key.toLowerCase().includes('organization') && !key.toLowerCase().includes('company')) {
                        recipientName = value;
                    }
                    if (key.toLowerCase().includes('organization') || key.toLowerCase().includes('company')) {
                        orgName = value;
                    }
                }
            }

            if (action === 'approve') {
                await collabRef.update({ status: 'approved' });

                // Send approval email
                const emailHTML = `
                    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #000; color: #fff; border-radius: 16px; overflow: hidden; border: 2px solid #333;">
                        <div style="background: #10B981; padding: 24px 32px; text-align: center;">
                            <h1 style="margin: 0; color: #000; font-size: 24px; font-weight: 900; letter-spacing: 1px;">E-CELL DYPIU</h1>
                            <p style="margin: 4px 0 0; color: #000; font-size: 14px; font-weight: 600;">Application Approved</p>
                        </div>
                        <div style="padding: 32px;">
                            <p style="color: #ccc; font-size: 15px; line-height: 1.6;">
                                Hi <strong style="color: #fff;">${recipientName}</strong>,
                            </p>
                            <p style="color: #ccc; font-size: 15px; line-height: 1.6;">
                                Great news! Your collaboration application for <strong>${orgName}</strong> has been <strong style="color: #10B981;">Approved</strong>.
                            </p>
                            <p style="color: #ccc; font-size: 15px; line-height: 1.6;">
                                Our team will be in touch with you shortly with further details. You can track your status anytime using the link below.
                            </p>
                            <div style="margin-top: 24px;">
                                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.ecelldypiu.in'}/collaborations/status/${id}" style="display: inline-block; background: #10B981; color: #000; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">Track Status</a>
                            </div>
                        </div>
                        <div style="background: #111; padding: 16px 32px; text-align: center; border-top: 1px solid #333;">
                            <p style="color: #666; font-size: 12px; margin: 0;">
                                E-Cell Entrepreneurship Cell, DY Patil International University
                            </p>
                        </div>
                    </div>
                `;
                if (recipientEmail) {
                    await sendEmail(recipientEmail, 'Collaboration Application Approved - E-Cell DYPIU', emailHTML);
                }

                return res.status(200).json({ success: true, message: 'Collaboration approved' });
            } else if (action === 'reject') {
                await collabRef.update({ status: 'rejected' });

                // Send rejection email
                const emailHTML = `
                    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #000; color: #fff; border-radius: 16px; overflow: hidden; border: 2px solid #333;">
                        <div style="background: #EF4444; padding: 24px 32px; text-align: center;">
                            <h1 style="margin: 0; color: #000; font-size: 24px; font-weight: 900; letter-spacing: 1px;">E-CELL DYPIU</h1>
                            <p style="margin: 4px 0 0; color: #000; font-size: 14px; font-weight: 600;">Application Update</p>
                        </div>
                        <div style="padding: 32px;">
                            <p style="color: #ccc; font-size: 15px; line-height: 1.6;">
                                Hi <strong style="color: #fff;">${recipientName}</strong>,
                            </p>
                            <p style="color: #ccc; font-size: 15px; line-height: 1.6;">
                                Thank you for your interest in collaborating with us for <strong>${orgName}</strong>.
                            </p>
                            <p style="color: #ccc; font-size: 15px; line-height: 1.6;">
                                After careful consideration, we are unable to proceed with your proposal at this time. We appreciate your interest and wish you the best in your endeavors.
                            </p>
                            <div style="margin-top: 24px;">
                                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.ecelldypiu.in'}/collaborations/status/${id}" style="display: inline-block; background: #333; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">View Application</a>
                            </div>
                        </div>
                        <div style="background: #111; padding: 16px 32px; text-align: center; border-top: 1px solid #333;">
                            <p style="color: #666; font-size: 12px; margin: 0;">
                                E-Cell Entrepreneurship Cell, DY Patil International University
                            </p>
                        </div>
                    </div>
                `;
                if (recipientEmail) {
                    await sendEmail(recipientEmail, 'Update on Collaboration Application - E-Cell DYPIU', emailHTML);
                }

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
