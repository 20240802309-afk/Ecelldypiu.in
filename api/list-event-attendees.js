// API endpoint to list ALL attendees for an event
// Searches subcollections under events/{eventId} AND root-level collections matching the event
// Admin-only endpoint

let db = null;

try {
    const { initializeApp, getApps, cert } = await import('firebase-admin/app');
    const { getFirestore } = await import('firebase-admin/firestore');

    const privateKey = process.env.FIREBASE_PRIVATE_KEY
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        : undefined;

    if (privateKey && privateKey.length > 100 && !getApps().length) {
        initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey,
            }),
        });
    }

    if (getApps().length) {
        db = getFirestore();
    }
} catch (e) {
    console.warn('⚠️  Firebase not available for list-event-attendees:', e.message);
}

// Extract keywords from event ID for matching root collections
function getEventKeywords(eventId) {
    // "innovate-for-impact" → ["innovate", "impact"]
    // "finbiz" → ["finbiz"]
    return eventId.split(/[-_]/).filter(w => w.length > 2 && !['for', 'the', 'and'].includes(w));
}

function collectionMatchesEvent(collName, eventId) {
    const keywords = getEventKeywords(eventId);
    const collLower = collName.toLowerCase();
    // Check if the collection name contains any significant keyword from the event ID
    return keywords.some(kw => collLower.includes(kw.toLowerCase()));
}

// Extract attendees from a collection snapshot
function extractAttendees(snapshot, sourceName) {
    const attendees = [];
    for (const doc of snapshot.docs) {
        const data = doc.data();

        // Add the document itself if it has name/email
        if (data.name || data.email) {
            attendees.push({
                id: doc.id,
                name: data.name || '',
                email: data.email || '',
                team: data.team || data.teamName || '',
                college: data.college || '',
                phone: data.phone || '',
                source: sourceName,
            });
        }

        // Also extract nested members
        if (data.members && Array.isArray(data.members)) {
            for (const member of data.members) {
                if (member.name || member.email) {
                    attendees.push({
                        id: `${doc.id}_${member.email || member.name}`,
                        name: member.name || '',
                        email: member.email || '',
                        team: data.teamName || data.team || data.name || '',
                        college: member.college || data.college || '',
                        phone: member.phone || '',
                        source: sourceName,
                    });
                }
            }
        }
    }
    return attendees;
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    // Admin auth
    const authHeader = req.headers.authorization;
    const adminKey = process.env.ADMIN_API_KEY;
    if (!adminKey || authHeader !== `Bearer ${adminKey}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const eventId = req.query?.eventId || new URL(req.url, 'http://localhost').searchParams.get('eventId');
    if (!eventId) {
        return res.status(400).json({ error: 'eventId is required' });
    }

    if (!db) {
        return res.status(503).json({ error: 'Database not available. Please configure Firebase credentials.' });
    }

    try {
        console.log(`\n📋 Listing all attendees for event: "${eventId}"`);
        let attendees = [];

        // 1) Search subcollections under events/{eventId}
        const eventDocRef = db.doc(`events/${eventId}`);
        try {
            const subcollections = await eventDocRef.listCollections();
            console.log(`📂 Subcollections under events/${eventId}: ${subcollections.map(c => c.id).join(', ') || '(none)'}`);

            for (const collRef of subcollections) {
                const snapshot = await collRef.get();
                console.log(`  📊 ${collRef.id}: ${snapshot.size} docs`);
                attendees.push(...extractAttendees(snapshot, `events/${eventId}/${collRef.id}`));
            }
        } catch (e) {
            console.warn('Could not list event subcollections:', e.message);
        }

        // 2) Search ROOT-level collections that match the event name
        try {
            const rootCollections = await db.listCollections();
            const rootNames = rootCollections.map(c => c.id);
            console.log(`📂 Root collections: ${rootNames.join(', ')}`);

            // Filter to collections matching the event keywords
            const matchingCollections = rootCollections.filter(c =>
                collectionMatchesEvent(c.id, eventId) &&
                !['events', 'BLOGS', 'SUBSCRIPTION_REQUESTS', 'TEAM_APPLICATION_FORM', 'certificate_templates', 'certificateConfigs'].includes(c.id)
            );

            console.log(`🎯 Root collections matching "${eventId}": ${matchingCollections.map(c => c.id).join(', ') || '(none)'}`);

            for (const collRef of matchingCollections) {
                const snapshot = await collRef.get();
                console.log(`  📊 ${collRef.id}: ${snapshot.size} docs`);
                attendees.push(...extractAttendees(snapshot, collRef.id));
            }
        } catch (e) {
            console.warn('Could not list root collections:', e.message);
        }

        console.log(`✅ Total attendees found: ${attendees.length}`);

        return res.status(200).json({
            success: true,
            eventId,
            count: attendees.length,
            attendees,
        });

    } catch (error) {
        console.error('Error listing attendees:', error);
        return res.status(500).json({
            error: 'Failed to list attendees',
            details: error.message
        });
    }
}
