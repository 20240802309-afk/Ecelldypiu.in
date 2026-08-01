import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

const Redirect = () => {
    const { slug } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const performRedirect = async () => {
            if (!slug) {
                if (isMounted) {
                    setError('Invalid short link.');
                    setLoading(false);
                }
                return;
            }

            try {
                const response = await fetch('/api/shortlink', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action: 'redirect',
                        slug: slug.trim().toLowerCase(),
                    }),
                });

                const data = await response.json();

                if (!response.ok || !data.success || !data.originalUrl) {
                    if (isMounted) {
                        setError(data.error || 'Link not found or has expired.');
                        setLoading(false);
                    }
                    return;
                }

                // Redirect to original URL
                window.location.href = data.originalUrl;
            } catch (err) {
                console.error('Redirection error:', err);
                if (isMounted) {
                    setError('Failed to resolve short link. Please try again.');
                    setLoading(false);
                }
            }
        };

        performRedirect();

        return () => {
            isMounted = false;
        };
    }, [slug]);

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
            {/* E-Cell Logo */}
            <div className="mb-8 flex items-center justify-center">
                <img
                    src="/logonew.png"
                    alt="E-Cell DYPIU Logo"
                    className="h-16 md:h-20 w-auto object-contain brightness-0 invert"
                />
            </div>

            {loading ? (
                <div className="bg-zinc-900 border-4 border-zinc-700 rounded-2xl p-8 max-w-md w-full shadow-[8px_8px_0px_#FFB22C] flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-brand-yellow animate-spin mb-4" />
                    <h2 className="text-xl font-black uppercase text-white mb-2">Redirecting...</h2>
                    <p className="text-gray-400 text-sm font-medium">
                        Please wait while we take you to your destination for <span className="text-brand-yellow font-mono font-bold">/s/{slug}</span>
                    </p>
                </div>
            ) : (
                <div className="bg-zinc-900 border-4 border-red-500 rounded-2xl p-8 max-w-md w-full shadow-[8px_8px_0px_#EF4444] flex flex-col items-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                    <h2 className="text-2xl font-black uppercase text-white mb-2">Link Not Found</h2>
                    <p className="text-gray-400 text-sm mb-6">
                        {error || `The requested short code "/s/${slug}" does not exist or has been deactivated.`}
                    </p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 bg-brand-yellow text-black font-black px-6 py-3 rounded-xl uppercase hover:bg-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Go to Homepage
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Redirect;
