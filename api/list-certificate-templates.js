// API endpoint to list certificate templates from public/certificates/
// Works in both Vite dev server and Vercel
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    try {
        // Resolve the certificates directory
        let certsDir;
        if (typeof __dirname !== 'undefined') {
            certsDir = path.resolve(__dirname, '..', 'public', 'certificates');
        } else {
            const __dir = path.dirname(fileURLToPath(import.meta.url));
            certsDir = path.resolve(__dir, '..', 'public', 'certificates');
        }

        if (!fs.existsSync(certsDir)) {
            return res.status(200).json({ templates: [] });
        }

        const files = fs.readdirSync(certsDir)
            .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f))
            .map(f => ({
                name: f.replace(/\.(png|jpg|jpeg|webp)$/i, '').replace(/[-_]/g, ' '),
                filename: f,
                url: `/certificates/${f}`,
            }));

        return res.status(200).json({ templates: files });

    } catch (error) {
        console.error('Error listing templates:', error);
        return res.status(500).json({
            error: 'Failed to list templates',
            details: error.message
        });
    }
}
