import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin (only once)
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

// Unified email sender supporting ZeptoMail and Resend
async function sendEmail(to, subject, htmlContent) {
    if (process.env.ZEPTOMAIL_API_KEY) {
        const url = process.env.ZEPTOMAIL_URL || 'https://api.zeptomail.in/v1.1/email';
        let authHeader = process.env.ZEPTOMAIL_API_KEY;
        if (!authHeader.toLowerCase().startsWith('zoho-enczapikey')) {
            authHeader = `Zoho-enczapikey ${authHeader}`;
        }

        const fromAddress = process.env.ZEPTOMAIL_FROM_ADDRESS || 'ecell@dypiu.ac.in';
        const fromName = process.env.ZEPTOMAIL_FROM_NAME || 'E-Cell DYPIU';

        let toName = '';
        let toAddress = to;
        const toMatch = to.match(/^(.*?)\s*<(.*?)>$/);
        if (toMatch) {
            toName = toMatch[1].trim();
            toAddress = toMatch[2].trim();
        }

        const payload = {
            from: {
                address: fromAddress,
                name: fromName
            },
            to: [
                {
                    email_address: {
                        address: toAddress,
                        name: toName || toAddress.split('@')[0]
                    }
                }
            ],
            subject: subject,
            htmlbody: htmlContent
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': authHeader
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`ZeptoMail send failed: ${error}`);
        }

        return response.json();
    }

    // Fallback to Resend
    if (!process.env.RESEND_API_KEY) {
        throw new Error('No email sending service configured (ZeptoMail or Resend)');
    }

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: process.env.EMAIL_FROM || 'E-Cell DYPIU <noreply@ecelldypiu.in>',
            to: [to],
            subject: subject,
            html: htmlContent,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Email send failed: ${JSON.stringify(error)}`);
    }

    return response.json();
}

// Generate Announcement Email Layout
function generateAnnouncementHTML(data, subscriberName) {
    const bannerHtml = data.bannerUrl 
        ? `<tr>
            <td align="center" style="padding: 0 0 30px 0;">
                <img src="${data.bannerUrl}" alt="${data.title}" width="520" style="display: block; width: 100%; max-width: 520px; border-radius: 12px; border: 2px solid #ffffff;" />
            </td>
           </tr>`
        : '';

    const buttonHtml = (data.buttonText && data.buttonUrl)
        ? `<tr>
            <td align="center" style="padding: 10px 0 20px 0;">
                <a href="${data.buttonUrl}" target="_blank" style="display: inline-block; background-color: #FFB22C; color: #000000; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; text-decoration: none; padding: 14px 35px; border-radius: 8px; text-transform: uppercase; border: 3px solid #ffffff;" class="mobile-cta">
                    ${data.buttonText}
                </a>
            </td>
           </tr>`
        : '';

    const formattedBody = (data.body || '').replace(/\n/g, '<br/>');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.title} - Announcement</title>
    <style type="text/css">
        @media only screen and (max-width: 620px) {
            .email-container { width: 100% !important; }
            .mobile-cta { width: 100% !important; display: block !important; box-sizing: border-box !important; text-align: center !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: Arial, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #000000;">
        <tr>
            <td align="center" style="padding: 30px 10px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" class="email-container" style="background-color: #18181b; border: 4px solid #ffffff; border-radius: 20px; overflow: hidden; max-width: 600px; width: 100%;">
                    <!-- Header Banner -->
                    <tr>
                        <td style="background-color: #FFB22C; padding: 25px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #000000; font-size: 26px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px;">
                                E-CELL DYPIU
                            </h1>
                            <p style="margin: 5px 0 0 0; color: #000000; font-size: 13px; font-weight: bold;">
                                OFFICIAL ANNOUNCEMENT 📢
                            </p>
                        </td>
                    </tr>
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 35px 40px; color: #ffffff;">
                            <p style="font-size: 17px; margin: 0 0 20px 0;">
                                Hello <strong>${subscriberName || 'E-Cell Member'}</strong>,
                            </p>
                            ${bannerHtml}
                            <h2 style="color: #FFB22C; font-size: 24px; font-weight: 900; margin: 0 0 15px 0; text-transform: uppercase; line-height: 1.3;">
                                ${data.title}
                            </h2>
                            ${data.subtitle ? `<p style="color: #e4e4e7; font-size: 16px; font-weight: bold; margin: 0 0 20px 0;">${data.subtitle}</p>` : ''}
                            <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6; margin: 0 0 35px 0;">
                                ${formattedBody}
                            </p>
                            ${buttonHtml}
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #0c0c0e; padding: 25px 30px; text-align: center; border-top: 2px solid #27272a;">
                            <p style="margin: 0; color: #71717a; font-size: 12px;">
                                © ${new Date().getFullYear()} E-Cell DYPIU. All rights reserved.
                            </p>
                            <p style="margin: 5px 0 0 0; color: #52525b; font-size: 11px;">
                                You are receiving this because you subscribed to updates from the E-Cell DYPIU portal.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;
}

// Generate Event Notification Email Layout
function generateEventHTML(data, subscriberName) {
    const bannerHtml = data.bannerUrl 
        ? `<tr>
            <td align="center" style="padding: 0 0 25px 0;">
                <img src="${data.bannerUrl}" alt="${data.title}" width="520" style="display: block; width: 100%; max-width: 520px; border-radius: 12px; border: 2px solid #ffffff;" />
            </td>
           </tr>`
        : '';

    const registerButtonHtml = data.registrationLink
        ? `<tr>
            <td align="center" style="padding: 10px 0 15px 0;">
                <a href="${data.registrationLink}" target="_blank" style="display: inline-block; background-color: #FFB22C; color: #000000; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; text-decoration: none; padding: 14px 35px; border-radius: 8px; text-transform: uppercase; border: 3px solid #ffffff;" class="mobile-cta">
                    ${data.buttonText || 'Register Now'}
                </a>
            </td>
           </tr>`
        : '';

    const formattedDesc = (data.description || '').replace(/\n/g, '<br/>');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Event Invite: ${data.title}</title>
    <style type="text/css">
        @media only screen and (max-width: 620px) {
            .email-container { width: 100% !important; }
            .mobile-cta { width: 100% !important; display: block !important; box-sizing: border-box !important; text-align: center !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: Arial, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #000000;">
        <tr>
            <td align="center" style="padding: 30px 10px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" class="email-container" style="background-color: #18181b; border: 4px solid #ffffff; border-radius: 20px; overflow: hidden; max-width: 600px; width: 100%;">
                    <!-- Header Banner -->
                    <tr>
                        <td style="background-color: #FFB22C; padding: 25px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #000000; font-size: 26px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px;">
                                E-CELL DYPIU
                            </h1>
                            <p style="margin: 5px 0 0 0; color: #000000; font-size: 13px; font-weight: bold;">
                                EVENT INVITATION 📅 🚀
                            </p>
                        </td>
                    </tr>
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 35px 40px; color: #ffffff;">
                            <p style="font-size: 17px; margin: 0 0 20px 0;">
                                Hi <strong>${subscriberName || 'Innovator'}</strong>,
                            </p>
                            ${bannerHtml}
                            <h2 style="color: #FFB22C; font-size: 24px; font-weight: 900; margin: 0 0 15px 0; text-transform: uppercase; line-height: 1.3;">
                                ${data.title}
                            </h2>
                            
                            <p style="color: #e4e4e7; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">
                                ${formattedDesc}
                            </p>
                            
                            <!-- Event Details Box -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #000000; border: 2px solid #3f3f46; border-radius: 12px; margin-bottom: 30px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <h3 style="margin: 0 0 12px 0; color: #FFB22C; font-size: 16px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #27272a; padding-bottom: 8px;">Event Details</h3>
                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                            ${data.date ? `<tr>
                                                <td style="padding: 4px 0; color: #a1a1aa; font-size: 14px; width: 80px; font-weight: bold;">DATE:</td>
                                                <td style="padding: 4px 0; color: #ffffff; font-size: 14px;">${data.date}</td>
                                            </tr>` : ''}
                                            ${data.time ? `<tr>
                                                <td style="padding: 4px 0; color: #a1a1aa; font-size: 14px; font-weight: bold;">TIME:</td>
                                                <td style="padding: 4px 0; color: #ffffff; font-size: 14px;">${data.time}</td>
                                            </tr>` : ''}
                                            ${data.venue ? `<tr>
                                                <td style="padding: 4px 0; color: #a1a1aa; font-size: 14px; font-weight: bold;">VENUE:</td>
                                                <td style="padding: 4px 0; color: #ffffff; font-size: 14px;">${data.venue}</td>
                                            </tr>` : ''}
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            ${registerButtonHtml}
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #0c0c0e; padding: 25px 30px; text-align: center; border-top: 2px solid #27272a;">
                            <p style="margin: 0; color: #71717a; font-size: 12px;">
                                © ${new Date().getFullYear()} E-Cell DYPIU. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;
}

// Generate Interview Schedule Email Layout
function generateInterviewHTML(data, candidateName) {
    const formattedNotes = (data.notes || data.body || '').replace(/\n/g, '<br/>');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interview Schedule - E-Cell DYPIU</title>
    <style type="text/css">
        @media only screen and (max-width: 620px) {
            .email-container { width: 100% !important; }
            .mobile-cta { width: 100% !important; display: block !important; box-sizing: border-box !important; text-align: center !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: Arial, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #000000;">
        <tr>
            <td align="center" style="padding: 30px 10px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" class="email-container" style="background-color: #18181b; border: 4px solid #ffffff; border-radius: 20px; overflow: hidden; max-width: 600px; width: 100%;">
                    <!-- Header Banner -->
                    <tr>
                        <td style="background-color: #FFB22C; padding: 25px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #000000; font-size: 26px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px;">
                                E-CELL DYPIU
                            </h1>
                            <p style="margin: 5px 0 0 0; color: #000000; font-size: 13px; font-weight: bold;">
                                TEAM SELECTION INTERVIEW INVITATION
                            </p>
                        </td>
                    </tr>
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 35px 40px; color: #ffffff;">
                            <p style="font-size: 17px; margin: 0 0 20px 0;">
                                Dear <strong>${candidateName || 'Applicant'}</strong>,
                            </p>
                            <p style="color: #e4e4e7; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">
                                Thank you for applying to join <strong>E-Cell DYPIU</strong>! Based on your application review, we are pleased to invite you for an interview round.
                            </p>
                            
                            <!-- Interview Details Box -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #000000; border: 2px solid #FFB22C; border-radius: 12px; margin-bottom: 30px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <h3 style="margin: 0 0 12px 0; color: #FFB22C; font-size: 16px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #27272a; padding-bottom: 8px;">Interview Schedule Details</h3>
                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                            ${data.role ? `<tr>
                                                <td style="padding: 6px 0; color: #a1a1aa; font-size: 14px; width: 100px; font-weight: bold;">ROLE:</td>
                                                <td style="padding: 6px 0; color: #FFB22C; font-size: 14px; font-weight: bold;">${data.role}</td>
                                            </tr>` : ''}
                                            ${data.date ? `<tr>
                                                <td style="padding: 6px 0; color: #a1a1aa; font-size: 14px; width: 100px; font-weight: bold;">DATE:</td>
                                                <td style="padding: 6px 0; color: #ffffff; font-size: 14px;">${data.date}</td>
                                            </tr>` : ''}
                                            ${data.time ? `<tr>
                                                <td style="padding: 6px 0; color: #a1a1aa; font-size: 14px; font-weight: bold;">TIME / SLOT:</td>
                                                <td style="padding: 6px 0; color: #ffffff; font-size: 14px;">${data.time}</td>
                                            </tr>` : ''}
                                            ${data.venue ? `<tr>
                                                <td style="padding: 6px 0; color: #a1a1aa; font-size: 14px; font-weight: bold;">LOCATION:</td>
                                                <td style="padding: 6px 0; color: #ffffff; font-size: 14px;">${data.venue}</td>
                                            </tr>` : ''}
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            ${formattedNotes ? `
                            <div style="background-color: #27272a; padding: 18px; border-radius: 10px; margin-bottom: 25px;">
                                <h4 style="margin: 0 0 8px 0; color: #FFB22C; font-size: 14px; text-transform: uppercase;">Important Instructions / Notes</h4>
                                <p style="color: #e4e4e7; font-size: 14px; line-height: 1.5; margin: 0;">${formattedNotes}</p>
                            </div>
                            ` : ''}

                            ${data.buttonUrl ? `
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td align="center" style="padding: 10px 0 15px 0;">
                                        <a href="${data.buttonUrl}" target="_blank" style="display: inline-block; background-color: #FFB22C; color: #000000; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; text-decoration: none; padding: 14px 35px; border-radius: 8px; text-transform: uppercase; border: 3px solid #ffffff;" class="mobile-cta">
                                            ${data.buttonText || 'Join Interview / Confirm Slot'}
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            ` : ''}

                            <p style="color: #a1a1aa; font-size: 14px; line-height: 1.5; margin: 25px 0 0 0;">
                                Best of luck! We look forward to meeting you.<br/><br/>
                                Warm regards,<br/>
                                <strong>Team E-Cell DYPIU</strong>
                            </p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #0c0c0e; padding: 25px 30px; text-align: center; border-top: 2px solid #27272a;">
                            <p style="margin: 0; color: #71717a; font-size: 12px;">
                                © ${new Date().getFullYear()} E-Cell DYPIU. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;
}

// Generate Generic Compose Email Layout
function generateGenericHTML(data, subscriberName) {
    const formattedBody = (data.body || '').replace(/\n/g, '<br/>');
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: Arial, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #000000;">
        <tr>
            <td align="center" style="padding: 30px 10px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #18181b; border: 4px solid #ffffff; border-radius: 20px; overflow: hidden; max-width: 600px; width: 100%;">
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #FFB22C; padding: 25px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #000000; font-size: 26px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px;">
                                E-CELL DYPIU
                            </h1>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding: 35px 40px; color: #ffffff; font-size: 15px; line-height: 1.6;">
                            ${formattedBody}
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #0c0c0e; padding: 25px 30px; text-align: center;">
                            <p style="margin: 0; color: #71717a; font-size: 11px;">
                                © ${new Date().getFullYear()} E-Cell DYPIU.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Verify admin API key
    const authHeader = req.headers.authorization;
    const adminKey = process.env.ADMIN_API_KEY;

    if (!adminKey || authHeader !== `Bearer ${adminKey}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { to, manualEmails, type, subject, data, selectedSubscribers } = req.body;

        if (!type || !subject) {
            return res.status(400).json({ error: 'Type and Subject are required' });
        }

        let recipients = [];
        let skippedDocs = [];
        let totalDocs = 0;

        // Resolve recipients based on 'to' setting
        if (to === 'all') {
            const subscribersSnapshot = await db.collection('SUBSCRIPTION_REQUESTS').get();
            totalDocs = subscribersSnapshot.size;

            subscribersSnapshot.forEach(doc => {
                const docData = doc.data();
                if (docData.email) {
                    recipients.push({
                        name: docData.name || 'Subscriber',
                        email: docData.email
                    });
                } else {
                    skippedDocs.push({ id: doc.id, fields: Object.keys(docData) });
                }
            });
        } else if (to === 'selected') {
            if (selectedSubscribers && Array.isArray(selectedSubscribers)) {
                recipients = selectedSubscribers.map(sub => ({
                    name: sub.name || 'Subscriber',
                    email: sub.email
                }));
                totalDocs = selectedSubscribers.length;
            }
        } else if (to === 'manual') {
            let emails = [];
            if (typeof manualEmails === 'string') {
                emails = manualEmails.split(',').map(e => e.trim()).filter(Boolean);
            } else if (Array.isArray(manualEmails)) {
                emails = manualEmails.map(e => e.trim()).filter(Boolean);
            }

            recipients = emails.map(email => ({
                name: email.split('@')[0],
                email: email
            }));
            totalDocs = emails.length;
        }

        if (recipients.length === 0) {
            return res.status(400).json({ error: 'No valid recipients selected' });
        }

        const results = {
            sent: 0,
            failed: 0,
            details: []
        };

        // Dispatch emails one-by-one
        for (let i = 0; i < recipients.length; i++) {
            const recipient = recipients[i];

            try {
                let recipientSubject = (subject || '')
                    .replace(/\{name\}/g, recipient.name || 'Applicant')
                    .replace(/\{email\}/g, recipient.email || '')
                    .replace(/\{role\}/g, recipient.role || data?.role || 'Team Role');

                let htmlContent = '';
                if (data && data.customHtml) {
                    htmlContent = data.customHtml
                        .replace(/\{name\}/g, recipient.name || 'Applicant')
                        .replace(/\{email\}/g, recipient.email || '')
                        .replace(/\{role\}/g, recipient.role || data.role || 'E-Cell Team Member')
                        .replace(/\{date\}/g, data.date || '')
                        .replace(/\{time\}/g, data.time || '')
                        .replace(/\{venue\}/g, data.venue || '');
                } else if (type === 'announcement') {
                    htmlContent = generateAnnouncementHTML(data, recipient.name);
                } else if (type === 'event') {
                    htmlContent = generateEventHTML(data, recipient.name);
                } else if (type === 'interview') {
                    htmlContent = generateInterviewHTML(data, recipient.name);
                } else {
                    htmlContent = generateGenericHTML(data, recipient.name);
                }

                await sendEmail(recipient.email, recipientSubject, htmlContent);
                results.sent++;
                results.details.push({
                    name: recipient.name,
                    email: recipient.email,
                    status: 'sent',
                    error: null
                });
            } catch (err) {
                results.failed++;
                results.details.push({
                    name: recipient.name,
                    email: recipient.email,
                    status: 'failed',
                    error: err.message
                });
            }

            // Rate limit delay between dispatches (1 second)
            if (i < recipients.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        return res.status(200).json({
            success: true,
            message: `Mailer finished dispatching`,
            results: {
                totalDocs,
                validSubscribers: recipients.length,
                skippedDocs: skippedDocs.length,
                sent: results.sent,
                failed: results.failed,
                details: results.details,
                skipped: skippedDocs
            }
        });

    } catch (error) {
        console.error('Mailer error:', error);
        return res.status(500).json({
            error: 'Failed to process mailing list',
            details: error.message
        });
    }
}
