export const AI_MODELS = {
    FLASH: 'gemini-2.0-flash',
    THINKING: 'gemini-2.0-flash-thinking-exp'
};

export const VIBES = [
    'Bold & Minimal',
    'Funky & Creative',
    'Formal & Tiered',
    'Tech & Cyberpunk',
    'Community Focused'
];

/**
 * Generates event content using the server-side Gemini proxy.
 * The API key is kept on the server — never exposed to the client.
 * @param {string} theme - The basic theme or title of the event.
 * @param {string} vibe - The visual/content vibe (e.g., Bold, Tech).
 * @param {string} model - The model ID to use.
 */
export const generateEventContent = async (theme, vibe, model = AI_MODELS.THINKING) => {
    try {
        const response = await fetch('https://us-central1-ecell-86bee.cloudfunctions.net/api/generate-content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ theme, vibe, model })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'AI content generation failed.');
        }

        return data;
    } catch (error) {
        console.error('AI Generation Error:', error);
        throw error;
    }
};
