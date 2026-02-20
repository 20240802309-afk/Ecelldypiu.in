// API endpoint to upload certificate templates to public/certificates/
// This is primarily for local development use
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // Verify admin API key
    const authHeader = req.headers.authorization;
    const adminKey = process.env.ADMIN_API_KEY;
    if (!adminKey || authHeader !== `Bearer ${adminKey}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { filename, imageData } = req.body;

        if (!filename || !imageData) {
            return res.status(400).json({ error: 'filename and imageData (base64) are required' });
        }

        // Sanitize filename
        const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase();
        if (!/\.(png|jpg|jpeg|webp)$/i.test(safeName)) {
            return res.status(400).json({ error: 'File must be a PNG, JPG, or WebP image' });
        }

        // Resolve certificates directory
        let certsDir;
        if (typeof __dirname !== 'undefined') {
            certsDir = path.resolve(__dirname, '..', 'public', 'certificates');
        } else {
            const __dir = path.dirname(fileURLToPath(import.meta.url));
            certsDir = path.resolve(__dir, '..', 'public', 'certificates');
        }

        // Create directory if it doesn't exist
        if (!fs.existsSync(certsDir)) {
            fs.mkdirSync(certsDir, { recursive: true });
        }

        // Remove base64 header if present
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Write file
        const filePath = path.join(certsDir, safeName);
        fs.writeFileSync(filePath, buffer);

        console.log('✅ Template uploaded:', safeName);

        return res.status(200).json({
            success: true,
            url: `/certificates/${safeName}`,
            filename: safeName,
            message: `Template "${safeName}" uploaded successfully`
        });

    } catch (error) {
        console.error('Error uploading template:', error);
        return res.status(500).json({
            error: 'Failed to upload template',
            details: error.message
        });
    }
}
