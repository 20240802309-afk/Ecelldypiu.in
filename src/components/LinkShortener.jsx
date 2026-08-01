import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Link as LinkIcon, Copy, Check, ExternalLink, Edit2, Trash2,
    Search, BarChart2, Plus, RefreshCw, AlertCircle,
    CheckCircle2, Loader2, X, ArrowLeft, ChevronLeft, ChevronRight,
    TrendingUp, Filter, ArrowUpDown, Tag
} from 'lucide-react';

const LinkShortener = ({ adminKey, onBack }) => {
    // Links data state
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    // Create form state
    const [longUrl, setLongUrl] = useState('');
    const [destinationName, setDestinationName] = useState('');
    const [customSlug, setCustomSlug] = useState('');
    const [creating, setCreating] = useState(false);
    const [createdLink, setCreatedLink] = useState(null);
    const [formValidationError, setFormValidationError] = useState('');

    // Filter, Search, Sort & Pagination state
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
    const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'most_clicks'
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Toast state
    const [toast, setToast] = useState(null); // { message, type }

    // Edit modal state
    const [editingLink, setEditingLink] = useState(null);
    const [editUrl, setEditUrl] = useState('');
    const [editDestinationName, setEditDestinationName] = useState('');
    const [editSlug, setEditSlug] = useState('');
    const [savingEdit, setSavingEdit] = useState(false);
    const [editValidationError, setEditValidationError] = useState('');

    // Delete modal state
    const [deletingLink, setDeletingLink] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Copy tracking
    const [copiedSlug, setCopiedSlug] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => {
            setToast(null);
        }, 3000);
    };

    // Fetch shortlinks
    const fetchLinks = useCallback(async (isManualRefresh = false) => {
        if (isManualRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/shortlink', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminKey}`
                },
                body: JSON.stringify({ action: 'list' })
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to fetch shortlinks');
            }

            setLinks(data.links || []);
        } catch (err) {
            console.error('Fetch shortlinks error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [adminKey]);

    useEffect(() => {
        fetchLinks();
    }, [fetchLinks]);

    // Summary Statistics
    const totalClicks = useMemo(() => {
        return links.reduce((sum, item) => sum + (item.clicks || 0), 0);
    }, [links]);

    const activeCount = useMemo(() => {
        return links.filter(item => item.isActive).length;
    }, [links]);

    // Handle Create Link
    const handleCreateLink = async (e) => {
        e.preventDefault();
        setFormValidationError('');

        if (!longUrl.trim()) {
            setFormValidationError('Original URL is required.');
            return;
        }

        const destTrimmed = destinationName.trim();
        if (!destTrimmed) {
            setFormValidationError('Destination Name is required.');
            return;
        }
        if (destTrimmed.length < 2 || destTrimmed.length > 60) {
            setFormValidationError('Destination Name must be between 2 and 60 characters.');
            return;
        }

        setCreating(true);
        setError(null);
        setCreatedLink(null);

        try {
            const response = await fetch('/api/shortlink', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminKey}`
                },
                body: JSON.stringify({
                    action: 'create',
                    originalUrl: longUrl.trim(),
                    destinationName: destTrimmed,
                    slug: customSlug.trim()
                })
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to create shortlink');
            }

            setCreatedLink(data);
            setLongUrl('');
            setDestinationName('');
            setCustomSlug('');
            showToast('Shortlink created successfully!');
            fetchLinks(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setCreating(false);
        }
    };

    // Handle Copy to Clipboard
    const handleCopy = (text, slug = null) => {
        navigator.clipboard.writeText(text);
        if (slug) {
            setCopiedSlug(slug);
            setTimeout(() => setCopiedSlug(null), 2000);
        }
        showToast('Copied short URL to clipboard!');
    };

    // Handle Edit Link
    const openEditModal = (link) => {
        setEditingLink(link);
        setEditUrl(link.originalUrl);
        setEditDestinationName(link.destinationName || '');
        setEditSlug(link.slug);
        setEditValidationError('');
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!editingLink) return;
        setEditValidationError('');

        const destTrimmed = editDestinationName.trim();
        if (!destTrimmed || destTrimmed.length < 2 || destTrimmed.length > 60) {
            setEditValidationError('Destination Name must be between 2 and 60 characters.');
            return;
        }

        setSavingEdit(true);
        setError(null);

        try {
            const response = await fetch('/api/shortlink', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminKey}`
                },
                body: JSON.stringify({
                    action: 'update',
                    slug: editingLink.slug,
                    originalUrl: editUrl.trim(),
                    destinationName: destTrimmed,
                    newSlug: editSlug.trim() !== editingLink.slug ? editSlug.trim() : undefined
                })
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to update shortlink');
            }

            showToast('Shortlink updated successfully!');
            setEditingLink(null);
            fetchLinks(true);
        } catch (err) {
            setEditValidationError(err.message);
        } finally {
            setSavingEdit(false);
        }
    };

    // Handle Delete Link
    const handleDeleteLink = async () => {
        if (!deletingLink) return;

        setDeleting(true);
        setError(null);

        try {
            const response = await fetch('/api/shortlink', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminKey}`
                },
                body: JSON.stringify({
                    action: 'delete',
                    slug: deletingLink.slug
                })
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to delete shortlink');
            }

            showToast('Shortlink deleted successfully!');
            setDeletingLink(null);
            fetchLinks(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setDeleting(false);
        }
    };

    // Handle Status Toggle
    const handleToggleStatus = async (link) => {
        try {
            const response = await fetch('/api/shortlink', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminKey}`
                },
                body: JSON.stringify({
                    action: 'update',
                    slug: link.slug,
                    isActive: !link.isActive
                })
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to update status');
            }

            showToast(`Shortlink set to ${!link.isActive ? 'Active' : 'Inactive'}`);
            fetchLinks(true);
        } catch (err) {
            setError(err.message);
        }
    };

    // Filtering & Sorting Logic
    const filteredLinks = useMemo(() => {
        return links.filter(item => {
            const matchesSearch =
                item.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.destinationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.originalUrl.toLowerCase().includes(searchQuery.toLowerCase());

            if (statusFilter === 'active') return matchesSearch && item.isActive;
            if (statusFilter === 'inactive') return matchesSearch && !item.isActive;
            return matchesSearch;
        }).sort((a, b) => {
            if (sortBy === 'oldest') {
                return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
            }
            if (sortBy === 'most_clicks') {
                return (b.clicks || 0) - (a.clicks || 0);
            }
            // Default: newest
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });
    }, [links, searchQuery, statusFilter, sortBy]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredLinks.length / itemsPerPage) || 1;
    const paginatedLinks = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredLinks.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredLinks, currentPage]);

    // Format date string
    const formatDate = (isoStr) => {
        if (!isoStr) return 'N/A';
        try {
            const d = new Date(isoStr);
            return d.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return 'N/A';
        }
    };

    // Truncate string helper
    const truncate = (str, n = 35) => {
        if (!str) return '';
        return str.length > n ? str.slice(0, n) + '...' : str;
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header & Back Button */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-gray-300 hover:text-white rounded-lg transition-colors"
                            title="Back to Dashboard"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    <div>
                        <h2 className="text-3xl font-black uppercase text-white flex items-center gap-3">
                            <LinkIcon className="w-8 h-8 text-brand-yellow" />
                            Link <span className="text-brand-yellow">Shortener</span>
                        </h2>
                        <p className="text-gray-400 text-sm">Create, track and manage short URL redirects for ecell.dypiu.ac.in</p>
                    </div>
                </div>

                <button
                    onClick={() => fetchLinks(true)}
                    disabled={refreshing}
                    className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-gray-300 hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Toast Notification */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 border-2 border-brand-yellow text-white px-6 py-3 rounded-xl shadow-[4px_4px_0px_#FFB22C] flex items-center gap-3 animate-bounce">
                    <CheckCircle2 className="w-5 h-5 text-brand-yellow" />
                    <span className="font-bold text-sm">{toast.message}</span>
                </div>
            )}

            {/* Top Summary Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-900 border-4 border-zinc-800 rounded-2xl p-6 flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Total Links</p>
                        <h3 className="text-3xl font-black text-white">{links.length}</h3>
                    </div>
                    <div className="w-12 h-12 bg-brand-yellow/10 rounded-xl flex items-center justify-center border border-brand-yellow/30">
                        <LinkIcon className="w-6 h-6 text-brand-yellow" />
                    </div>
                </div>

                <div className="bg-zinc-900 border-4 border-zinc-800 rounded-2xl p-6 flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Total Clicks</p>
                        <h3 className="text-3xl font-black text-brand-yellow font-mono">
                            {totalClicks.toLocaleString()}
                        </h3>
                    </div>
                    <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/30">
                        <TrendingUp className="w-6 h-6 text-green-400" />
                    </div>
                </div>

                <div className="bg-zinc-900 border-4 border-zinc-800 rounded-2xl p-6 flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Active Shortlinks</p>
                        <h3 className="text-3xl font-black text-green-400">{activeCount}</h3>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/30">
                        <BarChart2 className="w-6 h-6 text-blue-400" />
                    </div>
                </div>
            </div>

            {/* Alert Messages */}
            {error && (
                <div className="bg-red-900/30 border-2 border-red-500 text-red-400 p-4 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="font-bold text-sm">{error}</span>
                    </div>
                    <button onClick={() => setError(null)} className="text-red-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* TOP SECTION: Create New Link */}
            <div className="bg-zinc-900 border-4 border-white rounded-2xl p-6 md:p-8 shadow-[8px_8px_0px_#FFB22C]">
                <h3 className="text-xl font-black uppercase text-white mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-brand-yellow" />
                    Create New Shortlink
                </h3>

                {formValidationError && (
                    <div className="bg-red-900/40 border border-red-500 text-red-300 px-4 py-2 rounded-xl text-xs font-bold mb-4 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span>{formValidationError}</span>
                    </div>
                )}

                <form onSubmit={handleCreateLink} className="space-y-4">
                    {/* Field 1: Original URL */}
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-300 mb-2">
                            Original URL <span className="text-brand-yellow">*</span>
                        </label>
                        <input
                            type="url"
                            value={longUrl}
                            onChange={(e) => { setLongUrl(e.target.value); setFormValidationError(''); }}
                            placeholder="https://instagram.com/ecell.dypiu"
                            required
                            className="w-full bg-black border-2 border-zinc-700 p-3 text-white rounded-xl focus:border-brand-yellow focus:outline-none transition-colors text-sm"
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Field 2: Destination Name */}
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-300 mb-2">
                                Destination Name <span className="text-brand-yellow">*</span>
                            </label>
                            <input
                                type="text"
                                value={destinationName}
                                onChange={(e) => { setDestinationName(e.target.value); setFormValidationError(''); }}
                                placeholder="Example: Instagram"
                                required
                                minLength={2}
                                maxLength={60}
                                className="w-full bg-black border-2 border-zinc-700 p-3 text-white rounded-xl focus:border-brand-yellow focus:outline-none transition-colors text-sm"
                            />
                            <p className="text-zinc-500 text-xs mt-1">This name will be shown to visitors while they are being redirected.</p>
                        </div>

                        {/* Field 3: Custom Slug */}
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-300 mb-2">
                                Custom Slug <span className="text-gray-500">(Optional)</span>
                            </label>
                            <input
                                type="text"
                                value={customSlug}
                                onChange={(e) => setCustomSlug(e.target.value)}
                                placeholder="e.g. startup-summit"
                                className="w-full bg-black border-2 border-zinc-700 p-3 text-white rounded-xl focus:border-brand-yellow focus:outline-none transition-colors text-sm"
                            />
                            <p className="text-zinc-500 text-xs mt-1">Leave empty to auto-generate</p>
                        </div>
                    </div>

                    {/* Field 4: Create Button */}
                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={creating || !longUrl.trim() || !destinationName.trim()}
                            className="bg-brand-yellow text-black font-black px-6 py-3 rounded-xl uppercase hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {creating ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Creating Shortlink...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-5 h-5" />
                                    Shorten URL
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Generated Result Box */}
                {createdLink && (
                    <div className="mt-6 bg-black border-2 border-brand-yellow rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <p className="text-xs text-brand-yellow font-bold uppercase mb-1">Success! Your Short URL:</p>
                            <p className="text-lg font-mono font-bold text-white flex items-center gap-2">
                                <span>{createdLink.shortUrl}</span>
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                Destination: <span className="text-white font-bold">{createdLink.destinationName}</span>
                            </p>
                        </div>
                        <button
                            onClick={() => handleCopy(createdLink.shortUrl)}
                            className="bg-brand-yellow text-black px-4 py-2 rounded-lg font-bold uppercase text-xs hover:bg-white transition-colors flex items-center justify-center gap-2"
                        >
                            <Copy className="w-4 h-4" />
                            Copy Link
                        </button>
                    </div>
                )}
            </div>

            {/* BOTTOM SECTION: Manage Links Table */}
            <div className="bg-zinc-900 border-4 border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-xl font-black uppercase text-white flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-brand-yellow" />
                        Manage Shortlinks ({filteredLinks.length})
                    </h3>

                    {/* Controls: Search, Filter & Sort */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Search Input */}
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                placeholder="Search destination, slug, or URL..."
                                className="bg-black border-2 border-zinc-700 pl-9 pr-4 py-2 text-xs text-white rounded-xl focus:border-brand-yellow focus:outline-none w-48 md:w-64"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center gap-1 bg-black border-2 border-zinc-700 rounded-xl p-1 text-xs">
                            <Filter className="w-3.5 h-3.5 text-gray-400 ml-2" />
                            <select
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                                className="bg-transparent text-white focus:outline-none pr-2 text-xs"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        {/* Sort Selector */}
                        <div className="flex items-center gap-1 bg-black border-2 border-zinc-700 rounded-xl p-1 text-xs">
                            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 ml-2" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-transparent text-white focus:outline-none pr-2 text-xs"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="most_clicks">Most Clicks</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table / Cards List */}
                {loading ? (
                    <div className="py-16 text-center text-gray-400 flex flex-col items-center justify-center">
                        <Loader2 className="w-10 h-10 text-brand-yellow animate-spin mb-3" />
                        <p className="font-bold">Loading shortlinks...</p>
                    </div>
                ) : paginatedLinks.length === 0 ? (
                    <div className="py-16 text-center text-gray-500 bg-black/40 rounded-xl border-2 border-dashed border-zinc-800 p-8">
                        <LinkIcon className="w-12 h-12 mx-auto text-zinc-600 mb-3" />
                        <p className="text-white font-bold text-lg mb-1">No shortlinks found</p>
                        <p className="text-xs text-gray-400">
                            {searchQuery || statusFilter !== 'all'
                                ? 'Try adjusting your search query or status filter.'
                                : 'Create your first shortlink using the form above!'}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-zinc-700 text-gray-400 text-xs uppercase font-bold">
                                        <th className="py-3 px-4">Destination Name</th>
                                        <th className="py-3 px-4">Short URL (Admin Only)</th>
                                        <th className="py-3 px-4">Original Target</th>
                                        <th className="py-3 px-4">Clicks</th>
                                        <th className="py-3 px-4">Created On</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800 text-sm">
                                    {paginatedLinks.map((link) => {
                                        const fullShortUrl = `https://ecell.dypiu.ac.in/s/${link.slug}`;
                                        return (
                                            <tr key={link.id || link.slug} className="hover:bg-zinc-800/50 transition-colors">
                                                {/* Destination Name */}
                                                <td className="py-4 px-4 font-bold text-white">
                                                    <div className="flex items-center gap-2">
                                                        <Tag className="w-4 h-4 text-brand-yellow flex-shrink-0" />
                                                        <span>{link.destinationName || 'your destination'}</span>
                                                    </div>
                                                </td>

                                                {/* Short URL (Admin Only) */}
                                                <td className="py-4 px-4 font-mono font-bold text-brand-yellow">
                                                    <div className="flex items-center gap-2">
                                                        <span>/s/{link.slug}</span>
                                                        <button
                                                            onClick={() => handleCopy(fullShortUrl, link.slug)}
                                                            className="p-1 hover:bg-zinc-700 rounded text-gray-400 hover:text-white transition-colors"
                                                            title="Copy Short URL"
                                                        >
                                                            {copiedSlug === link.slug ? (
                                                                <Check className="w-4 h-4 text-green-400" />
                                                            ) : (
                                                                <Copy className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>

                                                {/* Original URL */}
                                                <td className="py-4 px-4 text-gray-300 max-w-xs" title={link.originalUrl}>
                                                    <a
                                                        href={link.originalUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 hover:text-brand-yellow hover:underline transition-colors"
                                                    >
                                                        <span>{truncate(link.originalUrl, 30)}</span>
                                                        <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 text-gray-500" />
                                                    </a>
                                                </td>

                                                {/* Clicks */}
                                                <td className="py-4 px-4 font-mono">
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black rounded-lg border border-zinc-700">
                                                        <BarChart2 className="w-3.5 h-3.5 text-brand-yellow" />
                                                        <span className="font-bold text-white">{(link.clicks || 0).toLocaleString()}</span>
                                                    </div>
                                                </td>

                                                {/* Created On */}
                                                <td className="py-4 px-4 text-gray-400 text-xs">
                                                    {formatDate(link.createdAt)}
                                                </td>

                                                {/* Status Badge */}
                                                <td className="py-4 px-4">
                                                    <button
                                                        onClick={() => handleToggleStatus(link)}
                                                        className={`px-3 py-1 rounded-full text-xs font-black uppercase transition-colors cursor-pointer ${link.isActive
                                                            ? 'bg-green-900/30 text-green-400 border border-green-500/50 hover:bg-green-900/50'
                                                            : 'bg-red-900/30 text-red-400 border border-red-500/50 hover:bg-red-900/50'
                                                            }`}
                                                    >
                                                        {link.isActive ? 'Active' : 'Inactive'}
                                                    </button>
                                                </td>

                                                {/* Actions */}
                                                <td className="py-4 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => openEditModal(link)}
                                                            className="p-2 bg-zinc-800 hover:bg-brand-yellow hover:text-black rounded-lg text-gray-300 transition-colors"
                                                            title="Edit Shortlink"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeletingLink(link)}
                                                            className="p-2 bg-zinc-800 hover:bg-red-600 hover:text-white rounded-lg text-red-400 transition-colors"
                                                            title="Delete Shortlink"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Stack Cards View */}
                        <div className="md:hidden space-y-4">
                            {paginatedLinks.map((link) => {
                                const fullShortUrl = `https://ecell.dypiu.ac.in/s/${link.slug}`;
                                return (
                                    <div key={link.id || link.slug} className="bg-black border-2 border-zinc-800 rounded-xl p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-white text-base flex items-center gap-1.5">
                                                <Tag className="w-4 h-4 text-brand-yellow" />
                                                {link.destinationName || 'your destination'}
                                            </span>
                                            <button
                                                onClick={() => handleToggleStatus(link)}
                                                className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${link.isActive ? 'bg-green-900/40 text-green-400 border border-green-500/50' : 'bg-red-900/40 text-red-400 border border-red-500/50'
                                                    }`}
                                            >
                                                {link.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </div>

                                        <div className="text-xs text-brand-yellow font-mono font-bold">
                                            Short URL: /s/{link.slug}
                                        </div>

                                        <div className="text-xs text-gray-400 break-all">
                                            <span className="font-bold text-gray-500 uppercase block mb-1">Target:</span>
                                            <a href={link.originalUrl} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-brand-yellow underline">
                                                {truncate(link.originalUrl, 50)}
                                            </a>
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-zinc-800">
                                            <span className="flex items-center gap-1 font-mono">
                                                <BarChart2 className="w-3.5 h-3.5 text-brand-yellow" />
                                                {(link.clicks || 0).toLocaleString()} clicks
                                            </span>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleCopy(fullShortUrl, link.slug)}
                                                    className="p-1.5 bg-zinc-800 rounded text-gray-300"
                                                    title="Copy Link"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(link)}
                                                    className="p-1.5 bg-zinc-800 rounded text-gray-300"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingLink(link)}
                                                    className="p-1.5 bg-zinc-800 rounded text-red-400"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination Bar */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between pt-4 border-t border-zinc-800 text-xs">
                                <span className="text-gray-400">
                                    Page {currentPage} of {totalPages} ({filteredLinks.length} total links)
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 bg-black border border-zinc-700 rounded-lg text-white disabled:opacity-40 disabled:cursor-not-allowed hover:border-brand-yellow transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className="font-bold text-white px-2">{currentPage}</span>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 bg-black border border-zinc-700 rounded-lg text-white disabled:opacity-40 disabled:cursor-not-allowed hover:border-brand-yellow transition-colors"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* EDIT MODAL */}
            {editingLink && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border-4 border-white rounded-2xl p-6 max-w-lg w-full shadow-[8px_8px_0px_#FFB22C] space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                            <h3 className="text-xl font-black uppercase text-white flex items-center gap-2">
                                <Edit2 className="w-5 h-5 text-brand-yellow" />
                                Edit Shortlink
                            </h3>
                            <button onClick={() => setEditingLink(null)} className="text-gray-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {editValidationError && (
                            <div className="bg-red-900/40 border border-red-500 text-red-300 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-red-400" />
                                <span>{editValidationError}</span>
                            </div>
                        )}

                        <form onSubmit={handleSaveEdit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                                    Original Destination URL <span className="text-brand-yellow">*</span>
                                </label>
                                <input
                                    type="url"
                                    value={editUrl}
                                    onChange={(e) => setEditUrl(e.target.value)}
                                    required
                                    className="w-full bg-black border-2 border-zinc-700 p-3 text-white rounded-xl focus:border-brand-yellow focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                                    Destination Name <span className="text-brand-yellow">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={editDestinationName}
                                    onChange={(e) => setEditDestinationName(e.target.value)}
                                    required
                                    minLength={2}
                                    maxLength={60}
                                    placeholder="Example: Instagram"
                                    className="w-full bg-black border-2 border-zinc-700 p-3 text-white rounded-xl focus:border-brand-yellow focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-300 mb-1">
                                    Short Code / Slug
                                </label>
                                <input
                                    type="text"
                                    value={editSlug}
                                    onChange={(e) => setEditSlug(e.target.value)}
                                    required
                                    className="w-full bg-black border-2 border-zinc-700 p-3 text-white rounded-xl font-mono focus:border-brand-yellow focus:outline-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingLink(null)}
                                    className="px-4 py-2 rounded-xl bg-zinc-800 text-gray-300 font-bold uppercase text-xs hover:bg-zinc-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingEdit}
                                    className="px-6 py-2 rounded-xl bg-brand-yellow text-black font-black uppercase text-xs hover:bg-white transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {savingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {deletingLink && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border-4 border-red-500 rounded-2xl p-6 max-w-md w-full shadow-[8px_8px_0px_#EF4444] space-y-4">
                        <div className="flex items-center gap-3 text-red-500">
                            <AlertCircle className="w-8 h-8 flex-shrink-0" />
                            <h3 className="text-xl font-black uppercase text-white">Delete Shortlink?</h3>
                        </div>

                        <p className="text-sm text-gray-300">
                            Are you sure you want to hard delete <span className="text-brand-yellow font-mono font-bold">/s/{deletingLink.slug}</span> ({deletingLink.destinationName})? This action cannot be undone.
                        </p>

                        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                            <button
                                onClick={() => setDeletingLink(null)}
                                className="px-4 py-2 rounded-xl bg-zinc-800 text-gray-300 font-bold uppercase text-xs hover:bg-zinc-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteLink}
                                disabled={deleting}
                                className="px-6 py-2 rounded-xl bg-red-600 text-white font-black uppercase text-xs hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LinkShortener;
