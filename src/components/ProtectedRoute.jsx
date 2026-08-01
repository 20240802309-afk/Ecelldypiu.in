import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
    const { currentUser, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
                <div className="mb-6">
                    <img
                        src="/logonew.png"
                        alt="E-Cell DYPIU"
                        className="h-12 w-auto object-contain"
                    />
                </div>
                <div className="bg-zinc-900 border-4 border-zinc-800 rounded-2xl p-8 max-w-sm w-full flex flex-col items-center shadow-[8px_8px_0px_#FFB22C]">
                    <Loader2 className="w-10 h-10 text-brand-yellow animate-spin mb-4" />
                    <p className="font-bold text-white uppercase text-sm tracking-wider">Verifying Session...</p>
                </div>
            </div>
        );
    }

    if (!currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
