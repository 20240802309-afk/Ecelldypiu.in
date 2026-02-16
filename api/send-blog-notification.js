// Vercel Serverless Function for Blog Notification Emails
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin (only once)
if (!getApps().length) {
    initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

const db = getFirestore();

// Email sending function using Resend API
async function sendEmail(to, subject, htmlContent) {
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

// Generate HTML email template for new blog notification
function generateBlogEmailHTML(blogData, subscriberName) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Blog Post - E-Cell DYPIU</title>
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: Arial, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #000000;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #18181b; border: 4px solid #ffffff; border-radius: 20px; overflow: hidden;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #FFB22C; padding: 30px 40px; text-align: center;">
                            <h1 style="margin: 0; color: #000000; font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px;">
                                E-CELL DYPIU
                            </h1>
                            <p style="margin: 10px 0 0 0; color: #000000; font-size: 14px; font-weight: bold;">
                                NEW BLOG POST ALERT 🚀
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="color: #ffffff; font-size: 18px; margin: 0 0 20px 0;">
                                Hey <strong>${subscriberName || 'there'}</strong>! 👋
                            </p>
                            
                            <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                We just published a new blog post that we think you'll love! Check it out:
                            </p>
                            
                            <!-- Blog Card -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #000000; border: 3px solid #FFB22C; border-radius: 16px; margin-bottom: 30px;">
                                <tr>
                                    <td style="padding: 30px;">
                                        <span style="display: inline-block; background-color: #FFB22C; color: #000000; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-bottom: 15px;">
                                            ${blogData.category || 'BLOG'}
                                        </span>
                                        
                                        <h2 style="color: #ffffff; font-size: 24px; font-weight: 900; margin: 15px 0; text-transform: uppercase; line-height: 1.3;">
                                            ${blogData.title}
                                        </h2>
                                        
                                        <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                                            ${blogData.excerpt || blogData.description || ''}
                                        </p>
                                        
                                        <p style="color: #71717a; font-size: 13px; margin: 0;">
                                            📅 ${blogData.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            ${blogData.readTime ? ` • ⏱️ ${blogData.readTime}` : ''}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- CTA Button -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td align="center">
                                        <a href="${blogData.url || 'https://ecelldypiu.in/blogs'}" 
                                           style="display: inline-block; background-color: #FFB22C; color: #000000; text-decoration: none; padding: 16px 40px; font-size: 16px; font-weight: 900; text-transform: uppercase; border-radius: 8px; border: 3px solid #000000;">
                                            READ NOW →
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #000000; padding: 30px 40px; border-top: 2px solid #27272a; text-align: center;">
                            <p style="color: #71717a; font-size: 13px; margin: 0 0 15px 0;">
                                You're receiving this because you subscribed to E-Cell DYPIU newsletter.
                            </p>
                            <p style="color: #52525b; font-size: 12px; margin: 0;">
                                © ${new Date().getFullYear()} E-Cell DYPIU. All rights reserved.<br>
                                Dr. D. Y. Patil International University, Pune
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
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Verify admin API key for security
    const authHeader = req.headers.authorization;
    const adminKey = process.env.ADMIN_API_KEY;

    if (!adminKey || authHeader !== `Bearer ${adminKey}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { title, excerpt, description, category, date, readTime, url } = req.body;

        // Validation
        if (!title) {
            return res.status(400).json({ error: 'Blog title is required' });
        }

        const blogData = {
            title,
            excerpt: excerpt || description,
            category: category || 'Blog',
            date: date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            readTime,
            url: url || 'https://ecelldypiu.in/blogs'
        };

        // Fetch all newsletter subscribers from Firebase
        const subscribersSnapshot = await db.collection('SUBSCRIPTION_REQUESTS').get();

        if (subscribersSnapshot.empty) {
            return res.status(200).json({
                success: true,
                message: 'No subscribers to notify',
                sentCount: 0
            });
        }

        const subscribers = [];
        subscribersSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.email) {
                subscribers.push({
                    name: data.name,
                    email: data.email
                });
            }
        });

        console.log(`Found ${subscribers.length} subscribers to notify`);

        // Send emails to all subscribers
        const emailSubject = `📢 New Blog: ${title} | E-Cell DYPIU`;
        const results = {
            sent: 0,
            failed: 0,
            errors: []
        };

        // Process emails in batches to avoid rate limits
        const BATCH_SIZE = 10;
        for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
            const batch = subscribers.slice(i, i + BATCH_SIZE);
            
            await Promise.all(
                batch.map(async (subscriber) => {
                    try {
                        const htmlContent = generateBlogEmailHTML(blogData, subscriber.name);
                        await sendEmail(subscriber.email, emailSubject, htmlContent);
                        results.sent++;
                        console.log(`✅ Email sent to: ${subscriber.email}`);
                    } catch (error) {
                        results.failed++;
                        results.errors.push({
                            email: subscriber.email,
                            error: error.message
                        });
                        console.error(`❌ Failed to send to ${subscriber.email}:`, error.message);
                    }
                })
            );

            // Add small delay between batches to respect rate limits
            if (i + BATCH_SIZE < subscribers.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        return res.status(200).json({
            success: true,
            message: `Blog notification sent`,
            blog: blogData,
            results: {
                totalSubscribers: subscribers.length,
                sent: results.sent,
                failed: results.failed,
                errors: results.errors.length > 0 ? results.errors : undefined
            }
        });

    } catch (error) {
        console.error('Error sending blog notifications:', error);
        return res.status(500).json({
            error: 'Failed to send blog notifications',
            details: error.message
        });
    }
}
