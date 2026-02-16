import { useState } from 'react';
import { Loader2, Send, AlertCircle, CheckCircle2, Lock } from 'lucide-react';

const AdminBlogNotify = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [adminKey, setAdminKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const [blogData, setBlogData] = useState({
        title: '',
        excerpt: '',
        category: 'Blog',
        date: new Date().toISOString().split('T')[0],
        readTime: '5 min read',
        url: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBlogData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (adminKey.trim()) {
            setIsAuthenticated(true);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch('/api/send-blog-notification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminKey}`
                },
                body: JSON.stringify(blogData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send notifications');
            }

            setResult(data);
            setBlogData({
                title: '',
                excerpt: '',
                category: 'Blog',
                date: new Date().toISOString().split('T')[0],
                readTime: '5 min read',
                url: ''
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Login Screen
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
                <div className="bg-zinc-900 border-4 border-white p-8 rounded-2xl max-w-md w-full shadow-[8px_8px_0px_#FFB22C]">
                    <div className="flex items-center justify-center mb-6">
                        <Lock className="w-12 h-12 text-brand-yellow" />
                    </div>
                    <h1 className="text-2xl font-black uppercase text-center mb-6">
                        ADMIN <span className="text-brand-yellow">ACCESS</span>
                    </h1>
                    <form onSubmit={handleLogin}>
                        <input
                            type="password"
                            value={adminKey}
                            onChange={(e) => setAdminKey(e.target.value)}
                            placeholder="Enter Admin API Key"
                            className="w-full bg-black border-2 border-zinc-700 p-4 text-white rounded-lg mb-4 focus:border-brand-yellow focus:outline-none"
                            required
                        />
                        <button
                            type="submit"
                            className="w-full bg-brand-yellow text-black font-black py-4 rounded-lg uppercase hover:bg-white transition-colors"
                        >
                            Login
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-20">
            <div className="container mx-auto px-4 max-w-2xl">
                <h1 className="text-4xl font-black uppercase text-center mb-2">
                    BLOG <span className="text-brand-yellow">NOTIFICATION</span>
                </h1>
                <p className="text-gray-400 text-center mb-8">
                    Send email notifications to all newsletter subscribers
                </p>

                {error && (
                    <div className="bg-red-900/20 border-2 border-red-500 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                {result && (
                    <div className="bg-green-900/20 border-2 border-green-500 text-green-400 p-6 rounded-xl mb-6">
                        <div className="flex items-center gap-3 mb-3">
                            <CheckCircle2 className="w-6 h-6" />
                            <span className="font-bold text-lg">Notifications Sent!</span>
                        </div>
                        <div className="text-sm space-y-1">
                            <p>Total Subscribers: {result.results?.totalSubscribers || 0}</p>
                            <p>Successfully Sent: {result.results?.sent || 0}</p>
                            {result.results?.failed > 0 && (
                                <p className="text-red-400">Failed: {result.results.failed}</p>
                            )}
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-zinc-900 border-4 border-white p-8 rounded-2xl shadow-[8px_8px_0px_#FFB22C]">
                    <div className="mb-6">
                        <label className="block text-lg font-bold uppercase mb-2">
                            Blog Title <span className="text-brand-yellow">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={blogData.title}
                            onChange={handleChange}
                            className="w-full bg-black border-2 border-zinc-700 p-4 text-white rounded-lg focus:border-brand-yellow focus:outline-none"
                            placeholder="Enter blog title"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-lg font-bold uppercase mb-2">
                            Excerpt / Description
                        </label>
                        <textarea
                            name="excerpt"
                            value={blogData.excerpt}
                            onChange={handleChange}
                            rows={3}
                            className="w-full bg-black border-2 border-zinc-700 p-4 text-white rounded-lg focus:border-brand-yellow focus:outline-none resize-none"
                            placeholder="Brief description of the blog"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-bold uppercase mb-2">
                                Category
                            </label>
                            <select
                                name="category"
                                value={blogData.category}
                                onChange={handleChange}
                                className="w-full bg-black border-2 border-zinc-700 p-4 text-white rounded-lg focus:border-brand-yellow focus:outline-none"
                            >
                                <option value="Blog">Blog</option>
                                <option value="Entrepreneurship">Entrepreneurship</option>
                                <option value="Events">Events</option>
                                <option value="Innovation">Innovation</option>
                                <option value="Startup">Startup</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold uppercase mb-2">
                                Read Time
                            </label>
                            <input
                                type="text"
                                name="readTime"
                                value={blogData.readTime}
                                onChange={handleChange}
                                className="w-full bg-black border-2 border-zinc-700 p-4 text-white rounded-lg focus:border-brand-yellow focus:outline-none"
                                placeholder="5 min read"
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-bold uppercase mb-2">
                            Blog URL
                        </label>
                        <input
                            type="url"
                            name="url"
                            value={blogData.url}
                            onChange={handleChange}
                            className="w-full bg-black border-2 border-zinc-700 p-4 text-white rounded-lg focus:border-brand-yellow focus:outline-none"
                            placeholder="https://ecelldypiu.in/blogs/your-blog-slug"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !blogData.title}
                        className="w-full bg-brand-yellow text-black text-xl font-black uppercase py-4 border-4 border-black hover:bg-white transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin w-6 h-6" />
                                Sending Notifications...
                            </>
                        ) : (
                            <>
                                <Send className="w-6 h-6" />
                                Send to All Subscribers
                            </>
                        )}
                    </button>
                </form>

                <p className="text-zinc-600 text-center mt-8 text-sm">
                    This will send an email notification to all registered newsletter subscribers.
                </p>
            </div>
        </div>
    );
};

export default AdminBlogNotify;
