// Vercel Serverless Function for Creating Blogs
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

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

    // Verify admin API key
    const authHeader = req.headers.authorization;
    const adminKey = process.env.ADMIN_API_KEY;

    if (!adminKey || authHeader !== `Bearer ${adminKey}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { 
            title, 
            slug, 
            excerpt, 
            content, 
            author, 
            category, 
            readTime, 
            tags, 
            images,
            date 
        } = req.body;

        // Validation
        if (!title || !slug || !excerpt || !content) {
            return res.status(400).json({ error: 'Title, slug, excerpt, and content are required' });
        }

        // Check if slug already exists
        const existingBlog = await db.collection('BLOGS').where('slug', '==', slug).get();
        if (!existingBlog.empty) {
            return res.status(400).json({ error: 'A blog with this slug already exists' });
        }

        // Create blog document
        const blogData = {
            title,
            slug,
            excerpt,
            content,
            author: author || 'E-Cell DYPIU',
            category: category || 'Entrepreneurship',
            readTime: readTime || '5 min read',
            tags: tags || [],
            images: images || [],
            date: date || new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            }),
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            published: true
        };

        const docRef = await db.collection('BLOGS').add(blogData);

        console.log('✅ Blog created:', docRef.id);

        return res.status(200).json({
            success: true,
            blog: {
                id: docRef.id,
                ...blogData
            },
            message: 'Blog created successfully'
        });

    } catch (error) {
        console.error('Error creating blog:', error);
        return res.status(500).json({
            error: 'Failed to create blog',
            details: error.message
        });
    }
}
