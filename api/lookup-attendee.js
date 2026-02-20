// API endpoint to look up an attendee by name or email (no OTP)
// Searches subcollections under events/{eventId} AND root-level collections matching the event

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
    console.warn('⚠️  Firebase not available for lookup-attendee:', e.message);
}

// Extract keywords from event ID for matching root collections
function getEventKeywords(eventId) {
    return eventId.split(/[-_]/).filter(w => w.length > 2 && !['for', 'the', 'and'].includes(w));
}

function collectionMatchesEvent(collName, eventId) {
    const keywords = getEventKeywords(eventId);
    const collLower = collName.toLowerCase();
    return keywords.some(kw => collLower.includes(kw.toLowerCase()));
}

// Search a collection for an attendee by email or name
function findInSnapshot(snapshot, searchTerm) {
    for (const doc of snapshot.docs) {
        const data = doc.data();

        // Check email (case-insensitive)
        const docEmail = (data.email || '').trim().toLowerCase();
        if (docEmail && docEmail === searchTerm) {
            return { doc, data, type: 'direct' };
        }

        // Check name (case-insensitive, partial match)
        const docName = (data.name || '').trim().toLowerCase();
        if (docName && (docName === searchTerm || docName.includes(searchTerm) || searchTerm.includes(docName))) {
            return { doc, data, type: 'direct' };
        }

        // Check nested members
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
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { eventId, identifier } = req.body;

        if (!eventId || !identifier) {
            return res.status(400).json({ error: 'eventId and identifier (name or email) are required' });
        }

        if (!db) {
            return res.status(503).json({
                error: 'Database not available. Please configure Firebase credentials.',
            });
        }

        const searchTerm = identifier.trim().toLowerCase();
        console.log(`\n🔍 Looking up attendee for event: "${eventId}", search: "${searchTerm}"`);

        let foundDoc = null;
        let foundData = null;
        let foundIn = '';

        // 1) Search subcollections under events/{eventId}
        const eventDocRef = db.doc(`events/${eventId}`);
        try {
            const subcollections = await eventDocRef.listCollections();
            console.log(`📂 Subcollections under events/${eventId}: ${subcollections.map(c => c.id).join(', ') || '(none)'}`);

            for (const collRef of subcollections) {
                const snapshot = await collRef.get();
                console.log(`  🔎 ${collRef.id}: ${snapshot.size} docs`);

                const result = findInSnapshot(snapshot, searchTerm);
                if (result) {
                    foundDoc = result.doc;
                    foundData = result.type === 'member' ? result.data : null;
                    foundIn = `events/${eventId}/${collRef.id}`;
                    console.log(`  ✅ Found in ${foundIn}`);
                    break;
                }
            }
        } catch (e) {
            console.warn('Could not search event subcollections:', e.message);
        }

        // 2) If not found, search ROOT-level collections matching the event
        if (!foundDoc) {
            try {
                const rootCollections = await db.listCollections();
                const skipCollections = ['events', 'BLOGS', 'SUBSCRIPTION_REQUESTS', 'TEAM_APPLICATION_FORM', 'certificate_templates', 'certificateConfigs'];

                const matchingCollections = rootCollections.filter(c =>
                    collectionMatchesEvent(c.id, eventId) && !skipCollections.includes(c.id)
                );

                console.log(`🎯 Root collections matching "${eventId}": ${matchingCollections.map(c => c.id).join(', ') || '(none)'}`);

                for (const collRef of matchingCollections) {
                    const snapshot = await collRef.get();
                    console.log(`  🔎 ${collRef.id}: ${snapshot.size} docs`);

                    const result = findInSnapshot(snapshot, searchTerm);
                    if (result) {
                        foundDoc = result.doc;
                        foundData = result.type === 'member' ? result.data : null;
                        foundIn = collRef.id;
                        console.log(`  ✅ Found in root collection: ${collRef.id}`);
                        break;
                    }
                }
            } catch (e) {
                console.warn('Could not search root collections:', e.message);
            }
        }

        if (!foundDoc) {
            console.log(`❌ No match found for "${searchTerm}"`);
            return res.status(404).json({
                error: 'No attendee found with that name or email. Please check your details and try again.'
            });
        }

        // Build attendee data
        const attendeeData = foundData || foundDoc.data();

        // Generate a unique ID for the attendee (especially for nested members)
        let uniqueAttendeeId = foundDoc.id;
        if (attendeeData !== foundDoc.data()) {
            // It's a nested member
            const suffix = (attendeeData.email || attendeeData.name || 'member').replace(/[^a-zA-Z0-9]/g, '');
            uniqueAttendeeId = `${foundDoc.id}-${suffix}`;
        }

        const attendeeEmail = (attendeeData.email || '').trim().toLowerCase();

        // Check eligibility from certificate config
        let eligibility = null;
        try {
            const configDoc = await db.collection('certificateConfigs').doc(eventId).get();
            if (configDoc.exists) {
                const configData = configDoc.data();
                const eligMap = configData.eligibility || {};
                if (eligMap[attendeeEmail]) {
                    eligibility = eligMap[attendeeEmail];
                }
            }
        } catch (e) {
            console.warn('Could not check eligibility:', e.message);
        }

        // If explicitly marked ineligible
        if (eligibility && eligibility.eligible === false) {
            return res.status(200).json({
                success: true,
                eligible: false,
                reason: eligibility.reason || 'You are not eligible for this certificate.',
                attendee: {
                    name: attendeeData.name || '',
                }
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
        return res.status(500).json({
            error: 'Failed to look up attendee',
            details: error.message
        });
    }
}
