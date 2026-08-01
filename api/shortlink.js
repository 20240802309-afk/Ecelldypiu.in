/* global process */
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';

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

// Helper to auto-generate a 6-character alphanumeric slug
const generateSlug = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

// Helper to validate URL format
const isValidUrl = (urlStr) => {
    if (!urlStr || typeof urlStr !== 'string') return false;
    const trimmed = urlStr.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return false;
    try {
        new URL(trimmed);
        return true;
    } catch {
        return false;
    }
};

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Determine payload/action regardless of GET/POST
    const body = req.body || {};
    const query = req.query || {};
    const action = body.action || query.action || (req.method === 'GET' ? 'redirect' : null);
    const slugParam = body.slug || query.slug;

    // Public action: redirect
    if (action === 'redirect') {
        return await handleRedirect(req, res, slugParam);
    }

    // All other actions require admin authorization
    const authHeader = req.headers.authorization;
    const adminKey = process.env.ADMIN_API_KEY;

    if (!adminKey || authHeader !== `Bearer ${adminKey}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        switch (action) {
            case 'create':
                return await handleCreate(req, res);
            case 'list':
                return await handleList(req, res);
            case 'delete':
                return await handleDelete(req, res);
            case 'update':
                return await handleUpdate(req, res);
            default:
                return res.status(400).json({ error: 'Invalid action specified' });
        }
    } catch (error) {
        console.error('Shortlink API error:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}

// ACTION: redirect (PUBLIC)
async function handleRedirect(req, res, slugFromQuery) {
    try {
        const slug = slugFromQuery || req.body?.slug;
        if (!slug) {
            return res.status(404).json({ error: 'Slug is required' });
        }

        const cleanSlug = slug.trim().toLowerCase();
        const docRef = db.collection('shortlinks').doc(cleanSlug);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return res.status(404).json({ error: 'Shortlink not found' });
        }

        const data = docSnap.data();
        if (data.isActive === false) {
            return res.status(404).json({ error: 'Shortlink is inactive' });
        }

        // Increment clicks and update lastClickedAt asynchronously
        await docRef.update({
            clicks: FieldValue.increment(1),
            lastClickedAt: Timestamp.now()
        });

        return res.status(200).json({
            success: true,
            originalUrl: data.originalUrl
        });
    } catch (error) {
        console.error('Redirect handler error:', error);
        return res.status(500).json({ error: 'Failed to process redirect', details: error.message });
    }
}

// ACTION: create (PROTECTED)
async function handleCreate(req, res) {
    const { originalUrl, slug } = req.body || {};

    if (!isValidUrl(originalUrl)) {
        return res.status(400).json({ error: 'Invalid URL. Please enter a valid URL starting with http:// or https://' });
    }

    const trimmedUrl = originalUrl.trim();
    let finalSlug = '';
    let isCustomSlug = false;

    if (slug && slug.trim()) {
        const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
        if (!cleanSlug) {
            return res.status(400).json({ error: 'Custom slug contains invalid characters' });
        }

        // Check uniqueness
        const docSnap = await db.collection('shortlinks').doc(cleanSlug).get();
        if (docSnap.exists) {
            return res.status(409).json({ error: 'Slug already exists. Please choose a different custom slug.' });
        }

        finalSlug = cleanSlug;
        isCustomSlug = true;
    } else {
        // Auto-generate 6-char alphanumeric slug, retry up to 5 times on collision
        let attempts = 0;
        let generated = '';
        let uniqueFound = false;

        while (attempts < 5 && !uniqueFound) {
            generated = generateSlug();
            const checkSnap = await db.collection('shortlinks').doc(generated).get();
            if (!checkSnap.exists) {
                uniqueFound = true;
            }
            attempts++;
        }

        if (!uniqueFound) {
            return res.status(409).json({ error: 'Failed to generate a unique short slug after multiple attempts. Please try again.' });
        }

        finalSlug = generated;
        isCustomSlug = false;
    }

    const now = Timestamp.now();
    const docData = {
        slug: finalSlug,
        originalUrl: trimmedUrl,
        createdAt: now,
        createdBy: 'admin',
        clicks: 0,
        lastClickedAt: null,
        isActive: true,
        customSlug: isCustomSlug
    };

    await db.collection('shortlinks').doc(finalSlug).set(docData);

    const createdAtIso = now.toDate().toISOString();

    return res.status(200).json({
        success: true,
        slug: finalSlug,
        shortUrl: `https://ecell.dypiu.ac.in/s/${finalSlug}`,
        originalUrl: trimmedUrl,
        clicks: 0,
        createdAt: createdAtIso,
        isActive: true
    });
}

// ACTION: list (PROTECTED)
async function handleList(req, res) {
    const snapshot = await db.collection('shortlinks').orderBy('createdAt', 'desc').get();

    const links = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        links.push({
            id: doc.id,
            slug: data.slug || doc.id,
            originalUrl: data.originalUrl || '',
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || null),
            createdBy: data.createdBy || 'admin',
            clicks: data.clicks || 0,
            lastClickedAt: data.lastClickedAt?.toDate ? data.lastClickedAt.toDate().toISOString() : (data.lastClickedAt || null),
            isActive: data.isActive !== undefined ? data.isActive : true,
            customSlug: data.customSlug || false
        });
    });

    return res.status(200).json({
        success: true,
        links,
        total: links.length
    });
}

// ACTION: delete (PROTECTED) - Hard delete document
async function handleDelete(req, res) {
    const { slug } = req.body || {};

    if (!slug) {
        return res.status(400).json({ error: 'Slug is required for deletion' });
    }

    const cleanSlug = slug.trim().toLowerCase();
    const docRef = db.collection('shortlinks').doc(cleanSlug);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
        return res.status(404).json({ error: 'Shortlink not found' });
    }

    await docRef.delete();

    return res.status(200).json({
        success: true,
        message: 'Shortlink deleted successfully'
    });
}

// ACTION: update (PROTECTED)
async function handleUpdate(req, res) {
    const { slug, originalUrl, newSlug, isActive } = req.body || {};

    if (!slug) {
        return res.status(400).json({ error: 'Slug is required for update' });
    }

    const cleanSlug = slug.trim().toLowerCase();
    const oldDocRef = db.collection('shortlinks').doc(cleanSlug);
    const oldSnap = await oldDocRef.get();

    if (!oldSnap.exists) {
        return res.status(404).json({ error: 'Shortlink not found' });
    }

    const oldData = oldSnap.data();

    // Check if originalUrl update is requested
    let updatedUrl = oldData.originalUrl;
    if (originalUrl !== undefined) {
        if (!isValidUrl(originalUrl)) {
            return res.status(400).json({ error: 'Invalid URL provided' });
        }
        updatedUrl = originalUrl.trim();
    }

    // Check if isActive update is requested
    const updatedIsActive = isActive !== undefined ? Boolean(isActive) : oldData.isActive;

    // Check if newSlug is provided and different from current slug
    if (newSlug && newSlug.trim().toLowerCase() !== cleanSlug) {
        const cleanNewSlug = newSlug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
        if (!cleanNewSlug) {
            return res.status(400).json({ error: 'New slug contains invalid characters' });
        }

        const newSnap = await db.collection('shortlinks').doc(cleanNewSlug).get();
        if (newSnap.exists) {
            return res.status(409).json({ error: 'New slug already exists' });
        }

        // Create new document with updated slug
        const newDocData = {
            ...oldData,
            slug: cleanNewSlug,
            originalUrl: updatedUrl,
            isActive: updatedIsActive,
            customSlug: true
        };

        await db.collection('shortlinks').doc(cleanNewSlug).set(newDocData);
        await oldDocRef.delete();

        return res.status(200).json({
            success: true,
            newSlug: cleanNewSlug,
            message: 'Shortlink updated with new slug'
        });
    }

    // Otherwise update in-place
    await oldDocRef.update({
        originalUrl: updatedUrl,
        isActive: updatedIsActive
    });

    return res.status(200).json({
        success: true,
        message: 'Shortlink updated successfully'
    });
}
