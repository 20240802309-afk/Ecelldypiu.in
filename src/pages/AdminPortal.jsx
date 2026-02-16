import { useState, useEffect } from 'react';
import { 
    Loader2, Send, AlertCircle, CheckCircle2, Lock, 
    PlusCircle, List, Bell, LogOut, Image, X, Upload,
    Calendar, Clock, Tag, User, Eye, Trash2, BookOpen
} from 'lucide-react';

const AdminPortal = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [adminKey, setAdminKey] = useState('');
    const [activeTab, setActiveTab] = useState('create-blog');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [blogs, setBlogs] = useState([]);
    const [loadingBlogs, setLoadingBlogs] = useState(false);

    // Blog form state
    const [blogData, setBlogData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        author: 'E-Cell DYPIU',
        category: 'Entrepreneurship',
        readTime: '5 min read',
        tags: '',
        images: []
    });

    // Image upload state
    const [imageUrls, setImageUrls] = useState(['']);
    const [previewImages, setPreviewImages] = useState([]);

    // Notification state
    const [notifyData, setNotifyData] = useState({
        blogId: '',
        title: '',
        excerpt: '',
        url: '',
        category: ''
    });

    // Check for saved auth
    useEffect(() => {
        const savedKey = sessionStorage.getItem('adminKey');
        if (savedKey) {
            setAdminKey(savedKey);
            setIsAuthenticated(true);
        }
    }, []);

    // Load blogs when authenticated
    useEffect(() => {
        if (isAuthenticated && activeTab === 'manage-blogs') {
            fetchBlogs();
        }
    }, [isAuthenticated, activeTab]);

    const fetchBlogs = async () => {
        setLoadingBlogs(true);
        try {
            const response = await fetch('/api/get-blogs');
            const data = await response.json();
            if (data.blogs) {
                setBlogs(data.blogs);
            }
        } catch (err) {
            console.error('Failed to fetch blogs:', err);
        } finally {
            setLoadingBlogs(false);
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (adminKey.trim()) {
            sessionStorage.setItem('adminKey', adminKey);
            setIsAuthenticated(true);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('adminKey');
        setAdminKey('');
        setIsAuthenticated(false);
    };

    const handleBlogChange = (e) => {
        const { name, value } = e.target;
        setBlogData(prev => ({ ...prev, [name]: value }));
        
        // Auto-generate slug from title
        if (name === 'title') {
            const slug = value
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
            setBlogData(prev => ({ ...prev, slug }));
        }
    };

    const addImageUrl = () => {
        setImageUrls([...imageUrls, '']);
    };

    const removeImageUrl = (index) => {
        const newUrls = imageUrls.filter((_, i) => i !== index);
        setImageUrls(newUrls.length ? newUrls : ['']);
    };

    const updateImageUrl = (index, value) => {
        const newUrls = [...imageUrls];
        newUrls[index] = value;
        setImageUrls(newUrls);
    };

    const handleCreateBlog = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            // Filter out empty image URLs
            const validImages = imageUrls.filter(url => url.trim());
            
            const payload = {
                ...blogData,
                images: validImages,
                tags: blogData.tags.split(',').map(t => t.trim()).filter(Boolean),
                date: new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })
            };

            const response = await fetch('/api/create-blog', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminKey}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create blog');
            }

            setResult({ 
                type: 'success', 
                message: 'Blog created successfully!',
                blog: data.blog
            });

            // Reset form
            setBlogData({
                title: '',
                slug: '',
                excerpt: '',
                content: '',
                author: 'E-Cell DYPIU',
                category: 'Entrepreneurship',
                readTime: '5 min read',
                tags: '',
                images: []
            });
            setImageUrls(['']);

            // Set notification data for quick notify
            setNotifyData({
                blogId: data.blog?.id,
                title: payload.title,
                excerpt: payload.excerpt,
                url: `https://ecelldypiu.in/blogs/${payload.slug}`,
                category: payload.category
            });

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSendNotification = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/send-blog-notification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminKey}`
                },
                body: JSON.stringify({
                    title: notifyData.title,
                    excerpt: notifyData.excerpt,
                    url: notifyData.url,
                    category: notifyData.category || 'Blog'
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send notifications');
            }

            setResult({
                type: 'notification',
                message: `Notifications sent to ${data.results?.sent || 0} of ${data.results?.validSubscribers || 0} subscribers!`,
                details: data.results?.details || [],
                sent: data.results?.sent || 0,
                failed: data.results?.failed || 0,
                total: data.results?.validSubscribers || 0,
                totalDocs: data.results?.totalDocs || 0,
                skipped: data.results?.skippedDocs || 0,
                skippedDetails: data.results?.skipped || []
            });

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBlog = async (blogId, blogSlug) => {
        if (!confirm('Are you sure you want to delete this blog?')) return;

        try {
            const response = await fetch('/api/delete-blog', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminKey}`
                },
                body: JSON.stringify({ id: blogId, slug: blogSlug })
            });

            if (!response.ok) {
                throw new Error('Failed to delete blog');
            }

            fetchBlogs();
        } catch (err) {
            setError(err.message);
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
                    <h1 className="text-2xl font-black uppercase text-center mb-2">
                        ADMIN <span className="text-brand-yellow">PORTAL</span>
                    </h1>
                    <p className="text-gray-400 text-center mb-6 text-sm">
                        E-Cell DYPIU Blog Management
                    </p>
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
        <div className="min-h-screen bg-black text-white pt-20">
            {/* Header */}
            <div className="bg-zinc-900 border-b-4 border-white">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-black uppercase">
                        ADMIN <span className="text-brand-yellow">PORTAL</span>
                    </h1>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-zinc-800 border-b-2 border-zinc-700">
                <div className="container mx-auto px-4">
                    <div className="flex gap-1 overflow-x-auto">
                        {[
                            { id: 'create-blog', label: 'Create Blog', icon: PlusCircle },
                            { id: 'manage-blogs', label: 'Manage Blogs', icon: List },
                            { id: 'notify', label: 'Send Notification', icon: Bell }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setError(null);
                                    setResult(null);
                                }}
                                className={`flex items-center gap-2 px-6 py-4 font-bold uppercase text-sm transition-colors whitespace-nowrap ${
                                    activeTab === tab.id 
                                        ? 'bg-black text-brand-yellow border-t-4 border-brand-yellow' 
                                        : 'text-gray-400 hover:text-white border-t-4 border-transparent'
                                }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                {/* Alerts */}
                {error && (
                    <div className="bg-red-900/20 border-2 border-red-500 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        {error}
                    </div>
                )}

                {result && (
                    <div className={`border-2 rounded-xl mb-6 ${result.type === 'notification' ? 'bg-blue-900/20 border-blue-500 text-blue-400' : 'bg-green-900/20 border-green-500 text-green-400'}`}>
                        <div className="p-4 flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                            <p className="font-bold">{result.message}</p>
                        </div>

                        {/* Notification Results Checklist */}
                        {result.type === 'notification' && result.details && result.details.length > 0 && (
                            <div className="border-t border-blue-500/30 p-4 bg-black/30 max-h-96 overflow-y-auto">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-white font-bold uppercase text-sm">Delivery Report</h4>
                                    <div className="flex gap-4 text-xs flex-wrap">
                                        <span className="text-green-400">✓ Sent: {result.sent}</span>
                                        {result.failed > 0 && <span className="text-red-400">✗ Failed: {result.failed}</span>}
                                        <span className="text-gray-400">Valid: {result.total}</span>
                                        {result.skipped > 0 && <span className="text-yellow-400">⚠ Skipped: {result.skipped}</span>}
                                        <span className="text-zinc-500">Total Docs: {result.totalDocs}</span>
                                    </div>
                                </div>
                                
                                {/* Skipped documents warning */}
                                {result.skipped > 0 && (
                                    <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-3 mb-4">
                                        <p className="text-yellow-400 text-sm font-bold mb-2">⚠️ {result.skipped} documents skipped (no email field)</p>
                                        <p className="text-yellow-500/70 text-xs mb-2">These documents in your Firebase don't have an 'email' field:</p>
                                        {result.skippedDetails && result.skippedDetails.length > 0 && (
                                            <ul className="text-xs text-yellow-400/80 space-y-1 max-h-24 overflow-y-auto">
                                                {result.skippedDetails.map((doc, idx) => (
                                                    <li key={idx} className="font-mono">
                                                        • {doc.id} (fields: {doc.fields.join(', ') || 'none'})
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}
                                
                                <div className="space-y-2">
                                    {result.details.map((item, idx) => (
                                        <div 
                                            key={idx} 
                                            className={`flex items-center justify-between p-3 rounded-lg ${
                                                item.status === 'sent' 
                                                    ? 'bg-green-900/20 border border-green-800' 
                                                    : 'bg-red-900/20 border border-red-800'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                                    item.status === 'sent' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'
                                                }`}>
                                                    {item.status === 'sent' ? '✓' : '✗'}
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold text-sm">{item.name || 'Unknown'}</p>
                                                    <p className="text-gray-400 text-xs">{item.email}</p>
                                                </div>
                                            </div>
                                            <span className={`text-xs font-bold uppercase ${
                                                item.status === 'sent' ? 'text-green-400' : 'text-red-400'
                                            }`}>
                                                {item.status === 'sent' ? 'Delivered' : 'Failed'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                {result.failed > 0 && (
                                    <p className="text-yellow-400 text-xs mt-4">
                                        ⚠️ Some emails failed. This could be due to invalid email addresses or rate limiting.
                                    </p>
                                )}
                            </div>
                        )}
                        
                        {result.type === 'success' && notifyData.title && (
                            <div className="border-t border-green-500/30 p-6 bg-black/30">
                                <h3 className="text-white font-black uppercase mb-4 flex items-center gap-2">
                                    <Bell className="w-5 h-5 text-brand-yellow" />
                                    Send Notification to Subscribers
                                </h3>
                                <div className="bg-zinc-900 rounded-lg p-4 mb-4 border border-zinc-700">
                                    <p className="text-white font-bold mb-1">{notifyData.title}</p>
                                    <p className="text-gray-400 text-sm mb-2">{notifyData.excerpt}</p>
                                    <p className="text-brand-yellow text-xs font-mono">{notifyData.url}</p>
                                </div>
                                <button
                                    onClick={handleSendNotification}
                                    disabled={loading}
                                    className="w-full bg-brand-yellow text-black py-4 rounded-xl font-black uppercase text-lg flex items-center justify-center gap-3 hover:bg-white transition-colors disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Sending Notifications...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Send Notification to All Subscribers
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Create Blog Tab */}
                {activeTab === 'create-blog' && (
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-black uppercase mb-6">
                            Create New <span className="text-brand-yellow">Blog</span>
                        </h2>

                        <form onSubmit={handleCreateBlog} className="space-y-6">
                            {/* Title & Slug */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold uppercase mb-2">
                                        Title <span className="text-brand-yellow">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={blogData.title}
                                        onChange={handleBlogChange}
                                        className="w-full bg-zinc-900 border-2 border-zinc-700 p-4 text-white rounded-lg focus:border-brand-yellow focus:outline-none"
                                        placeholder="Blog Title"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold uppercase mb-2">
                                        URL Slug
                                    </label>
                                    <input
                                        type="text"
                                        name="slug"
                                        value={blogData.slug}
                                        onChange={handleBlogChange}
                                        className="w-full bg-zinc-900 border-2 border-zinc-700 p-4 text-white rounded-lg focus:border-brand-yellow focus:outline-none font-mono text-sm"
                                        placeholder="auto-generated-from-title"
                                    />
                                </div>
                            </div>

                            {/* Author & Category */}
                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-bold uppercase mb-2">
                                        Author
                                    </label>
                                    <input
                                        type="text"
                                        name="author"
                                        value={blogData.author}
                                        onChange={handleBlogChange}
                                        className="w-full bg-zinc-900 border-2 border-zinc-700 p-4 text-white rounded-lg focus:border-brand-yellow focus:outline-none"
                                        placeholder="E-Cell DYPIU"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold uppercase mb-2">
                                        Category
                                    </label>
                                    <select
                                        name="category"
                                        value={blogData.category}
                                        onChange={handleBlogChange}
                                        className="w-full bg-zinc-900 border-2 border-zinc-700 p-4 text-white rounded-lg focus:border-brand-yellow focus:outline-none"
                                    >
                                        <option value="Entrepreneurship">Entrepreneurship</option>
                                        <option value="Events">Events</option>
                                        <option value="Innovation">Innovation</option>
                                        <option value="Startup">Startup</option>
                                        <option value="Technology">Technology</option>
                                        <option value="Insights">Insights</option>
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
                                        onChange={handleBlogChange}
                                        className="w-full bg-zinc-900 border-2 border-zinc-700 p-4 text-white rounded-lg focus:border-brand-yellow focus:outline-none"
                                        placeholder="5 min read"
                                    />
                                </div>
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-bold uppercase mb-2">
                                    Tags (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    name="tags"
                                    value={blogData.tags}
                                    onChange={handleBlogChange}
                                    className="w-full bg-zinc-900 border-2 border-zinc-700 p-4 text-white rounded-lg focus:border-brand-yellow focus:outline-none"
                                    placeholder="E-Cell, Innovation, Event"
                                />
                            </div>

                            {/* Excerpt */}
                            <div>
                                <label className="block text-sm font-bold uppercase mb-2">
                                    Excerpt / Short Description <span className="text-brand-yellow">*</span>
                                </label>
                                <textarea
                                    name="excerpt"
                                    value={blogData.excerpt}
                                    onChange={handleBlogChange}
                                    rows={2}
                                    className="w-full bg-zinc-900 border-2 border-zinc-700 p-4 text-white rounded-lg focus:border-brand-yellow focus:outline-none resize-none"
                                    placeholder="Brief description shown on blog listing..."
                                    required
                                />
                            </div>

                            {/* Content */}
                            <div>
                                <label className="block text-sm font-bold uppercase mb-2">
                                    Full Content <span className="text-brand-yellow">*</span>
                                </label>
                                <p className="text-gray-500 text-xs mb-2">
                                    Separate paragraphs with blank lines. Use double line breaks for section headings.
                                </p>
                                <textarea
                                    name="content"
                                    value={blogData.content}
                                    onChange={handleBlogChange}
                                    rows={12}
                                    className="w-full bg-zinc-900 border-2 border-zinc-700 p-4 text-white rounded-lg focus:border-brand-yellow focus:outline-none resize-none font-mono text-sm"
                                    placeholder="Write your blog content here...

Section Heading

Paragraph content goes here. Write naturally and separate paragraphs with blank lines.

Another Section

More content..."
                                    required
                                />
                            </div>

                            {/* Images */}
                            <div>
                                <label className="block text-sm font-bold uppercase mb-2">
                                    <Image className="w-4 h-4 inline mr-2" />
                                    Image URLs
                                </label>
                                <p className="text-gray-500 text-xs mb-3">
                                    Add image URLs. Place images in /public/blog/[slug]/ folder and use paths like /blog/slug/image.jpg
                                </p>
                                <div className="space-y-2">
                                    {imageUrls.map((url, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={url}
                                                onChange={(e) => updateImageUrl(index, e.target.value)}
                                                className="flex-1 bg-zinc-900 border-2 border-zinc-700 p-3 text-white rounded-lg focus:border-brand-yellow focus:outline-none text-sm"
                                                placeholder="/blog/slug/image1.jpg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImageUrl(index)}
                                                className="p-3 bg-red-900/50 text-red-400 rounded-lg hover:bg-red-900 transition-colors"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addImageUrl}
                                        className="flex items-center gap-2 text-brand-yellow hover:text-white transition-colors text-sm font-bold"
                                    >
                                        <PlusCircle className="w-4 h-4" />
                                        Add Another Image
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-brand-yellow text-black text-xl font-black uppercase py-5 border-4 border-black hover:bg-white transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-[4px_4px_0px_#fff]"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin w-6 h-6" />
                                        Creating Blog...
                                    </>
                                ) : (
                                    <>
                                        <PlusCircle className="w-6 h-6" />
                                        Publish Blog
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {/* Manage Blogs Tab */}
                {activeTab === 'manage-blogs' && (
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-black uppercase mb-6">
                            Manage <span className="text-brand-yellow">Blogs</span>
                        </h2>

                        {/* Dynamic Blogs from Firebase */}
                        <h3 className="text-xl font-bold text-brand-yellow mb-4 flex items-center gap-2">
                            <PlusCircle className="w-5 h-5" />
                            Dynamic Blogs (Firebase)
                        </h3>

                        {loadingBlogs ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-brand-yellow" />
                            </div>
                        ) : blogs.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 bg-zinc-900/50 rounded-xl border border-zinc-800 mb-8">
                                <List className="w-10 h-10 mx-auto mb-3 opacity-50" />
                                <p>No dynamic blogs yet. Create one above!</p>
                            </div>
                        ) : (
                            <div className="space-y-4 mb-8">
                                {blogs.map((blog) => (
                                    <div
                                        key={blog.id}
                                        className="bg-zinc-900 border-2 border-zinc-700 rounded-xl p-6 hover:border-brand-yellow transition-colors"
                                    >
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="bg-brand-yellow text-black px-2 py-1 rounded text-xs font-bold">
                                                        {blog.category}
                                                    </span>
                                                    <span className="text-gray-500 text-xs">
                                                        {blog.date}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-black mb-2">{blog.title}</h3>
                                                <p className="text-gray-400 text-sm line-clamp-2">{blog.excerpt}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <a
                                                    href={`/blogs/${blog.slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 bg-zinc-800 text-white rounded-lg hover:bg-brand-yellow hover:text-black transition-colors"
                                                    title="View"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </a>
                                                <button
                                                    onClick={() => {
                                                        setNotifyData({
                                                            title: blog.title,
                                                            excerpt: blog.excerpt,
                                                            url: `https://ecelldypiu.in/blogs/${blog.slug}`,
                                                            category: blog.category
                                                        });
                                                        setActiveTab('notify');
                                                    }}
                                                    className="p-2 bg-blue-900/50 text-blue-400 rounded-lg hover:bg-blue-900 transition-colors"
                                                    title="Send Notification"
                                                >
                                                    <Bell className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteBlog(blog.id, blog.slug)}
                                                    className="p-2 bg-red-900/50 text-red-400 rounded-lg hover:bg-red-900 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Static/Legacy Blogs */}
                        <h3 className="text-xl font-bold text-gray-400 mb-4 flex items-center gap-2 mt-8">
                            <BookOpen className="w-5 h-5" />
                            Legacy Blogs (Static)
                        </h3>
                        <p className="text-gray-500 text-sm mb-4">
                            These blogs are hardcoded in the codebase and cannot be edited from here.
                        </p>

                        <div className="space-y-4">
                            {[
                                {
                                    id: 'static-1',
                                    title: 'E-Cell DYPIU Blog: Where Ideas Meet Impact',
                                    slug: 'where-ideas-meet-impact',
                                    category: 'Entrepreneurship',
                                    date: 'September 20, 2025',
                                    excerpt: 'Discover how E-Cell DYPIU is transforming entrepreneurial dreams into reality through innovative programs, events, and community building.'
                                },
                                {
                                    id: 'static-2',
                                    title: 'E-Cell DYPIU at COEP Pune E-Cell Meetup',
                                    slug: 'ceo-pune-meetup',
                                    category: 'Events',
                                    date: 'September 27, 2025',
                                    excerpt: 'A collaborative gathering of Pune\'s brightest entrepreneurial minds, fostering connections and sharing innovative ideas.'
                                },
                                {
                                    id: 'static-3',
                                    title: 'E-Cell DYPIU at Entrepreneurship Awareness Drive',
                                    slug: 'entrepreneurship-awareness-drive',
                                    category: 'Events',
                                    date: 'October 1, 2025',
                                    excerpt: 'E-Cell DYPIU takes the lead in spreading entrepreneurship awareness across Pune.'
                                }
                            ].map((blog) => (
                                <div
                                    key={blog.id}
                                    className="bg-zinc-900/50 border-2 border-zinc-800 rounded-xl p-6 opacity-80"
                                >
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="bg-zinc-700 text-gray-300 px-2 py-1 rounded text-xs font-bold">
                                                    {blog.category}
                                                </span>
                                                <span className="bg-zinc-800 text-zinc-500 px-2 py-1 rounded text-xs">
                                                    STATIC
                                                </span>
                                                <span className="text-gray-500 text-xs">
                                                    {blog.date}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-black mb-2 text-gray-300">{blog.title}</h3>
                                            <p className="text-gray-500 text-sm line-clamp-2">{blog.excerpt}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <a
                                                href={`/blogs/${blog.slug}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 bg-zinc-800 text-gray-400 rounded-lg hover:bg-brand-yellow hover:text-black transition-colors"
                                                title="View"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </a>
                                            <button
                                                onClick={() => {
                                                    setNotifyData({
                                                        title: blog.title,
                                                        excerpt: blog.excerpt,
                                                        url: `https://ecelldypiu.in/blogs/${blog.slug}`,
                                                        category: blog.category
                                                    });
                                                    setActiveTab('notify');
                                                }}
                                                className="p-2 bg-blue-900/50 text-blue-400 rounded-lg hover:bg-blue-900 transition-colors"
                                                title="Send Notification"
                                            >
                                                <Bell className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Notify Tab */}
                {activeTab === 'notify' && (
                    <div className="max-w-2xl mx-auto">
                        <h2 className="text-3xl font-black uppercase mb-6">
                            Send <span className="text-brand-yellow">Notification</span>
                        </h2>
                        <p className="text-gray-400 mb-6">
                            Send email notification to all newsletter subscribers about a new blog.
                        </p>

                        <div className="bg-zinc-900 border-4 border-white p-8 rounded-2xl shadow-[8px_8px_0px_#FFB22C]">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold uppercase mb-2">
                                        Blog Title <span className="text-brand-yellow">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={notifyData.title}
                                        onChange={(e) => setNotifyData(prev => ({ ...prev, title: e.target.value }))}
                                        className="w-full bg-black border-2 border-zinc-700 p-4 text-white rounded-lg focus:border-brand-yellow focus:outline-none"
                                        placeholder="Blog title for notification"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold uppercase mb-2">
                                        Excerpt
                                    </label>
                                    <textarea
                                        value={notifyData.excerpt}
                                        onChange={(e) => setNotifyData(prev => ({ ...prev, excerpt: e.target.value }))}
                                        rows={2}
                                        className="w-full bg-black border-2 border-zinc-700 p-4 text-white rounded-lg focus:border-brand-yellow focus:outline-none resize-none"
                                        placeholder="Brief description for email"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold uppercase mb-2">
                                        Blog URL
                                    </label>
                                    <input
                                        type="url"
                                        value={notifyData.url}
                                        onChange={(e) => setNotifyData(prev => ({ ...prev, url: e.target.value }))}
                                        className="w-full bg-black border-2 border-zinc-700 p-4 text-white rounded-lg focus:border-brand-yellow focus:outline-none"
                                        placeholder="https://ecelldypiu.in/blogs/your-blog-slug"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold uppercase mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={notifyData.category}
                                        onChange={(e) => setNotifyData(prev => ({ ...prev, category: e.target.value }))}
                                        className="w-full bg-black border-2 border-zinc-700 p-4 text-white rounded-lg focus:border-brand-yellow focus:outline-none"
                                    >
                                        <option value="">Select Category</option>
                                        <option value="Entrepreneurship">Entrepreneurship</option>
                                        <option value="Events">Events</option>
                                        <option value="Innovation">Innovation</option>
                                        <option value="Startup">Startup</option>
                                        <option value="Technology">Technology</option>
                                        <option value="Insights">Insights</option>
                                    </select>
                                </div>

                                <button
                                    onClick={handleSendNotification}
                                    disabled={loading || !notifyData.title}
                                    className="w-full bg-brand-yellow text-black text-xl font-black uppercase py-4 border-4 border-black hover:bg-white transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl mt-4"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin w-6 h-6" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-6 h-6" />
                                            Send to All Subscribers
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPortal;
