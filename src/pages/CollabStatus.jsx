import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Clock, XCircle, ArrowLeft, Building2, User, Calendar } from 'lucide-react';

const CollabStatus = () => {
    const { id } = useParams();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/get-collaboration-status?id=${id}`);
                const data = await response.json();

                if (response.ok && data.success) {
                    setApplication(data.application);
                } else {
                    setError(data.error || 'Failed to fetch application status');
                }
            } catch (err) {
                console.error("Error fetching status:", err);
                setError('An error occurred while fetching the status.');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchStatus();
    }, [id]);

    const getStatusConfig = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved':
                return {
                    icon: <CheckCircle className="w-16 h-16 text-green-500 mb-4" />,
                    title: 'Application Approved',
                    description: 'Congratulations! Your collaboration application has been approved. Our team will contact you shortly with the next steps.',
                    color: 'text-green-500',
                    bg: 'bg-green-500/10 border-green-500/30'
                };
            case 'rejected':
                return {
                    icon: <XCircle className="w-16 h-16 text-red-500 mb-4" />,
                    title: 'Application Update',
                    description: 'Thank you for your interest. Unfortunately, we are unable to proceed with your proposal at this time. We wish you the best in your endeavors.',
                    color: 'text-red-500',
                    bg: 'bg-red-500/10 border-red-500/30'
                };
            case 'pending':
            default:
                return {
                    icon: <Clock className="w-16 h-16 text-brand-yellow mb-4" />,
                    title: 'Application Under Review',
                    description: 'Your application is currently being reviewed by our team. We will notify you via email once a decision has been made.',
                    color: 'text-brand-yellow',
                    bg: 'bg-brand-yellow/10 border-brand-yellow/30'
                };
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black pt-32 pb-20 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-yellow"></div>
            </div>
        );
    }

    if (error || !application) {
        return (
            <div className="min-h-screen bg-black pt-32 pb-20 px-4">
                <div className="max-w-2xl mx-auto text-center">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                    <h1 className="text-3xl font-black text-white mb-4">Application Not Found</h1>
                    <p className="text-gray-400 mb-8">{error || "We couldn't find an application with that ID."}</p>
                    <Link to="/collaborations" className="inline-flex items-center text-brand-yellow hover:text-white transition-colors duration-300">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Return to Collaborations
                    </Link>
                </div>
            </div>
        );
    }

    const config = getStatusConfig(application.status);

    return (
        <div className="min-h-screen bg-black pt-32 pb-20 px-4">
            <div className="max-w-3xl mx-auto">
                <Link to="/collaborations" className="inline-flex items-center text-gray-400 hover:text-brand-yellow transition-colors duration-300 mb-8">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Collaborations
                </Link>

                <div className="bg-[#111] border border-gray-800 rounded-3xl p-8 md:p-12 relative overflow-hidden">
                    {/* Background glow based on status */}
                    <div className={"absolute top-0 left-1/2 -translate-x-1/2 w-[200%] md:w-full h-64 opacity-20 blur-[100px] pointer-events-none " + config.bg.split(' ')[0]}></div>

                    <div className="relative z-10 text-center mb-12">
                        <div className="flex justify-center">{config.icon}</div>
                        <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">{config.title}</h1>
                        <p className="text-gray-300 text-lg max-w-xl mx-auto leading-relaxed">
                            {config.description}
                        </p>
                    </div>

                    <div className={"rounded-2xl border p-6 md:p-8 " + config.bg}>
                        <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-700/50 pb-4">Application Details</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start">
                                <Building2 className="w-5 h-5 text-gray-400 mt-1 mr-3 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Organization</p>
                                    <p className="text-white font-medium">{application.organization}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <User className="w-5 h-5 text-gray-400 mt-1 mr-3 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Contact Name</p>
                                    <p className="text-white font-medium">{application.contactName}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <Calendar className="w-5 h-5 text-gray-400 mt-1 mr-3 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Submitted On</p>
                                    <p className="text-white font-medium">
                                        {application.createdAt ? new Date(application.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        }) : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="w-5 h-5 mt-1 mr-3 flex-shrink-0 flex justify-center">
                                    <div className={"w-3 h-3 rounded-full mt-1 " + config.bg.split(' ')[0].replace('/10', '')}></div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Current Status</p>
                                    <p className={"font-bold capitalize " + config.color}>{application.status}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500">
                            Application ID: <span className="font-mono bg-black px-2 py-1 rounded text-gray-400">{application.id}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CollabStatus;
