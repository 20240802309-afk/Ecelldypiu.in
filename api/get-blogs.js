// Vercel Serverless Function for Getting Blogs
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

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { slug } = req.query;

        // If slug provided, get single blog
        if (slug) {
            const blogsSnapshot = await db.collection('BLOGS')
                .where('slug', '==', slug)
                .where('published', '==', true)
                .limit(1)
                .get();

            if (blogsSnapshot.empty) {
                return res.status(404).json({ error: 'Blog not found' });
            }

            const doc = blogsSnapshot.docs[0];
            return res.status(200).json({
                success: true,
                blog: {
                    id: doc.id,
                    ...doc.data()
                }
            });
        }

        // Get all published blogs, ordered by creation date
        let blogsSnapshot;
        try {
            blogsSnapshot = await db.collection('BLOGS')
                .where('published', '==', true)
                .orderBy('createdAt', 'desc')
                .get();
        } catch (indexError) {
            // Fallback: if composite index not available, get all and filter/sort in memory
            console.log('Index error, using fallback:', indexError.message);
            const allBlogsSnapshot = await db.collection('BLOGS').get();
            const allBlogs = [];
            allBlogsSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.published === true) {
                    allBlogs.push({
                        id: doc.id,
                        ...data
                    });
                }
            });
            // Sort by createdAt descending
            allBlogs.sort((a, b) => {
                const aTime = a.createdAt?.toMillis?.() || 0;
                const bTime = b.createdAt?.toMillis?.() || 0;
                return bTime - aTime;
            });
            return res.status(200).json({
                success: true,
                blogs: allBlogs,
                total: allBlogs.length
            });
        }

        const blogs = [];
        blogsSnapshot.forEach(doc => {
            blogs.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return res.status(200).json({
            success: true,
            blogs,
            count: blogs.length
        });

    } catch (error) {
        console.error('Error fetching blogs:', error);
        return res.status(500).json({
            error: 'Failed to fetch blogs',
            details: error.message
        });
    }
}
