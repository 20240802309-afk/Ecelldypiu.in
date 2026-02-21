import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

let db = null;

try {
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
    console.warn('⚠️  Firebase not available for event API:', e.message);
}

function getEventKeywords(eventId) {
    return eventId.split(/[-_]/).filter(w => w.length > 2 && !['for', 'the', 'and'].includes(w));
}

function collectionMatchesEvent(collName, eventId) {
    const keywords = getEventKeywords(eventId);
    const collLower = collName.toLowerCase();
    return keywords.some(kw => collLower.includes(kw.toLowerCase()));
}

function extractAttendees(snapshot, sourceName) {
    const attendees = [];
    for (const doc of snapshot.docs) {
        const data = doc.data();

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

function findInSnapshot(snapshot, searchTerm) {
    for (const doc of snapshot.docs) {
        const data = doc.data();

        const docEmail = (data.email || '').trim().toLowerCase();
        if (docEmail && docEmail === searchTerm) return { doc, data, type: 'direct' };

        const docName = (data.name || '').trim().toLowerCase();
        if (docName && (docName === searchTerm || docName.includes(searchTerm) || searchTerm.includes(docName))) {
            return { doc, data, type: 'direct' };
        }

        if (data.members && Array.isArray(data.members)) {
            for (const member of data.members) {
                const memberEmail = (member.email || '').trim().toLowerCase();
                const memberName = (member.name || '').trim().toLowerCase();
                if ((memberEmail && memberEmail === searchTerm) ||
                    (memberName && (memberName === searchTerm || memberName.includes(searchTerm)))) {
                    return {
                        doc,
                        data: {
                            name: member.name || '',
                            email: member.email || '',
                            team: data.teamName || data.team || data.name || '',
                            college: member.college || data.college || '',
                            phone: member.phone || '',
                            role: member.role || 'member',
                        },
                        type: 'member'
                    };
                }
            }
        }
    }
    return null;
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const url = new URL(req.url, 'http://localhost');
    const actionQuery = req.query?.action || url.searchParams.get('action');
    const action = actionQuery || req.body?.action;

    if (req.method === 'GET') {
        if (action === 'list-attendees') {
            return await handleListAttendees(req, res);
        }
    }

    if (req.method === 'POST') {
        if (action === 'lookup-attendee') {
            return await handleLookupAttendee(req, res);
        } else if (action === 'submit-application') {
            return await handleSubmitApplication(req, res);
        } else if (action === 'verify-admin') {
            return await handleVerifyAdmin(req, res);
        }
    }

    return res.status(405).json({ error: 'Method not allowed or invalid action' });
}

async function handleListAttendees(req, res) {
    const authHeader = req.headers.authorization;
    const adminKey = process.env.ADMIN_API_KEY;
    if (!adminKey || authHeader !== `Bearer ${adminKey}`) return res.status(401).json({ error: 'Unauthorized' });

    const eventId = req.query?.eventId || new URL(req.url, 'http://localhost').searchParams.get('eventId');
    if (!eventId) return res.status(400).json({ error: 'eventId is required' });

    if (!db) return res.status(503).json({ error: 'Database not available' });

    try {
        let attendees = [];
        const eventDocRef = db.doc(`events/${eventId}`);

        try {
            const subcollections = await eventDocRef.listCollections();
            for (const collRef of subcollections) {
                const snapshot = await collRef.get();
                attendees.push(...extractAttendees(snapshot, `events/${eventId}/${collRef.id}`));
            }
        } catch (e) {
            console.warn('Could not list event subcollections:', e.message);
        }

        try {
            const rootCollections = await db.listCollections();
            const matchingCollections = rootCollections.filter(c =>
                collectionMatchesEvent(c.id, eventId) &&
                !['events', 'BLOGS', 'SUBSCRIPTION_REQUESTS', 'TEAM_APPLICATION_FORM', 'certificate_templates', 'certificateConfigs'].includes(c.id)
            );

            for (const collRef of matchingCollections) {
                const snapshot = await collRef.get();
                attendees.push(...extractAttendees(snapshot, collRef.id));
            }
        } catch (e) {
            console.warn('Could not list root collections:', e.message);
        }

        return res.status(200).json({ success: true, eventId, count: attendees.length, attendees });
    } catch (error) {
        console.error('Error listing attendees:', error);
        return res.status(500).json({ error: 'Failed to list attendees', details: error.message });
    }
}

async function handleLookupAttendee(req, res) {
    try {
        const { eventId, identifier } = req.body;
        if (!eventId || !identifier) return res.status(400).json({ error: 'eventId and identifier required' });
        if (!db) return res.status(503).json({ error: 'Database not available' });

        const searchTerm = identifier.trim().toLowerCase();
        let foundDoc = null, foundData = null, foundIn = '';

        const eventDocRef = db.doc(`events/${eventId}`);
        try {
            const subcollections = await eventDocRef.listCollections();
            for (const collRef of subcollections) {
                const snapshot = await collRef.get();
                const result = findInSnapshot(snapshot, searchTerm);
                if (result) {
                    foundDoc = result.doc;
                    foundData = result.type === 'member' ? result.data : null;
                    foundIn = `events/${eventId}/${collRef.id}`;
                    break;
                }
            }
        } catch (e) {
            console.warn('Could not search subcollections:', e.message);
        }

        if (!foundDoc) {
            try {
                const rootCollections = await db.listCollections();
                const skipFiles = ['events', 'BLOGS', 'SUBSCRIPTION_REQUESTS', 'TEAM_APPLICATION_FORM', 'certificate_templates', 'certificateConfigs'];
                const matchingCollections = rootCollections.filter(c => collectionMatchesEvent(c.id, eventId) && !skipFiles.includes(c.id));

                for (const collRef of matchingCollections) {
                    const snapshot = await collRef.get();
                    const result = findInSnapshot(snapshot, searchTerm);
                    if (result) {
                        foundDoc = result.doc;
                        foundData = result.type === 'member' ? result.data : null;
                        foundIn = collRef.id;
                        break;
                    }
                }
            } catch (e) {
                console.warn('Could not search root collections:', e.message);
            }
        }

        if (!foundDoc) return res.status(404).json({ error: 'No attendee found' });

        const attendeeData = foundData || foundDoc.data();
        let uniqueAttendeeId = foundDoc.id;

        if (attendeeData !== foundDoc.data()) {
            const suffix = (attendeeData.email || attendeeData.name || 'member').replace(/[^a-zA-Z0-9]/g, '');
            uniqueAttendeeId = `${foundDoc.id}-${suffix}`;
        }

        const attendeeEmail = (attendeeData.email || '').trim().toLowerCase();
        let eligibility = null;

        try {
            const configDoc = await db.collection('certificateConfigs').doc(eventId).get();
            if (configDoc.exists) {
                const eligMap = configDoc.data().eligibility || {};
                if (eligMap[attendeeEmail]) eligibility = eligMap[attendeeEmail];
            }
        } catch (e) {
            console.warn('Could not check eligibility:', e.message);
        }

        if (eligibility && eligibility.eligible === false) {
            return res.status(200).json({
                success: true,
                eligible: false,
                reason: eligibility.reason || 'You are not eligible for this certificate.',
                attendee: { name: attendeeData.name || '' }
            });
        }

        return res.status(200).json({
            success: true,
            eligible: true,
            attendeeId: uniqueAttendeeId,
            foundIn,
            attendee: {
                name: attendeeData.name || '',
                email: attendeeData.email || '',
                team: attendeeData.team || attendeeData.teamName || '',
                college: attendeeData.college || '',
                phone: attendeeData.phone || '',
                role: attendeeData.role || '',
            }
        });

    } catch (error) {
        console.error('Error looking up attendee:', error);
        return res.status(500).json({ error: 'Failed to look up attendee', details: error.message });
    }
}

async function handleSubmitApplication(req, res) {
    if (!db) return res.status(503).json({ error: 'Database not available' });

    try {
        const formData = req.body;
        const docRef = await db.collection('TEAM_APPLICATION_FORM').add({
            ...formData,
            submittedAt: Timestamp.now(),
        });

        return res.status(200).json({
            success: true,
            id: docRef.id,
            message: 'Application submitted successfully'
        });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Failed to submit application', details: error.message });
    }
}

async function handleVerifyAdmin(req, res) {
    const authHeader = req.headers.authorization;
    const adminKey = process.env.ADMIN_API_KEY;

    if (!adminKey) return res.status(500).json({ error: 'Admin key not configured on server' });

    if (!authHeader || authHeader !== `Bearer ${adminKey}`) {
        return res.status(401).json({ error: 'Unauthorized', message: 'Invalid admin key' });
    }

    return res.status(200).json({ success: true, message: 'Authenticated successfully' });
}
