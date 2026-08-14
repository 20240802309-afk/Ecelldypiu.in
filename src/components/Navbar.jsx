import { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { X, User, LogOut, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/useAuth';

const MotionNav = motion.nav;
const MotionSpan = motion.span;
const MotionDiv = motion.div;

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, userProfile, logout } = useAuth();

  const userInitial = useMemo(() => {
    if (userProfile?.name) return userProfile.name.charAt(0).toUpperCase();
    if (currentUser?.email) return currentUser.email.charAt(0).toUpperCase();
    return 'M';
  }, [userProfile?.name, currentUser?.email]);

  if (location.pathname === '/ourlinks' || location.pathname.startsWith('/s/')) return null;

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Sponsors', path: '/sponsors' },
    { name: 'Events', path: '/events' },
    { name: 'Team', path: '/team' },
    { name: 'Collaborations', path: '/collaborations' },
    { name: 'Blogs', path: '/blogs' },
  ];

  const handleLogout = async () => {
    setShowDropdown(false);
    setIsOpen(false);
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <>
      <MotionNav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "circOut" }}
        className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[94%] md:w-fit max-w-[96vw]"
      >
        <div className="bg-black/90 backdrop-blur-md border border-brand-yellow rounded-full px-4 sm:px-6 py-2 sm:py-2.5 shadow-[0_0_25px_rgba(255,178,44,0.5),0_0_50px_rgba(255,178,44,0.25)] flex items-center justify-between md:justify-center gap-3 md:gap-4 lg:gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 flex-shrink-0 select-none group">
            <img
              src="/logonew.png"
              alt="E-Cell"
              className="h-8 md:h-9 w-auto object-contain brightness-0 invert group-hover:scale-105 transition-transform"
            />
            <span className="text-white font-black text-sm md:text-base tracking-tight uppercase whitespace-nowrap group-hover:text-brand-yellow transition-colors">
              ECELL DYPIU
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-0.5 bg-white/5 rounded-full px-1 py-1 border border-white/10 flex-shrink-0">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`relative px-2 lg:px-3.5 py-2 text-[10px] lg:text-xs font-bold uppercase tracking-wide transition-all duration-300 rounded-full whitespace-nowrap ${location.pathname === item.path
                  ? 'text-black bg-brand-yellow shadow-[0_0_10px_rgba(255,178,44,0.5)]'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Action: Auth or Let's Talk */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 bg-brand-yellow text-black font-black px-3 py-1.5 rounded-full border-2 border-brand-yellow hover:bg-white transition-all text-xs uppercase"
                >
                  <div className="w-6 h-6 rounded-full bg-black text-brand-yellow font-black flex items-center justify-center text-xs border border-brand-yellow">
                    {userInitial}
                  </div>
                  <span className="max-w-[100px] truncate">{userProfile?.name?.split(' ')[0] || 'Profile'}</span>
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-3 w-48 bg-zinc-900 border-2 border-brand-yellow rounded-2xl p-2 shadow-[4px_4px_0px_#FFB22C] z-50">
                    <div className="px-3 py-2 border-b border-zinc-800">
                      <p className="text-white font-bold text-xs truncate">{userProfile?.name || 'Member'}</p>
                      <p className="text-gray-400 text-[10px] truncate">{currentUser.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase text-gray-200 hover:text-brand-yellow hover:bg-zinc-800 rounded-xl transition-colors mt-1"
                    >
                      <User className="w-4 h-4 text-brand-yellow" />
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase text-red-400 hover:text-white hover:bg-red-900/40 rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white text-xs font-bold uppercase px-3 py-2 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-brand-yellow text-black px-4 py-2 rounded-full font-black text-xs hover:bg-white transition-all border-2 border-transparent uppercase tracking-wider shadow-[0_0_15px_rgba(255,178,44,0.4)] whitespace-nowrap"
                >
                  Join Us
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="block md:hidden text-white p-2 hover:bg-white/10 rounded-full transition-colors ml-auto flex-shrink-0"
            aria-label="Toggle navigation menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between items-center relative">
              <MotionSpan
                animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                className="w-full h-0.5 bg-white block origin-center transition-transform"
              />
              <MotionSpan
                animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
                className="w-full h-0.5 bg-white block transition-opacity"
              />
              <MotionSpan
                animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                className="w-full h-0.5 bg-white block origin-center transition-transform"
              />
            </div>
          </button>
        </div>
      </MotionNav>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isOpen && (
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mobile-menu-overlay md:hidden"
          >
            {/* Header Card */}
            <MotionDiv
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mobile-header-card"
            >
              <div className="flex items-center space-x-3 select-none cursor-pointer">
                <img
                  src="/logonew.png"
                  alt="E-Cell"
                  className="h-8 w-auto object-contain brightness-0 invert pointer-events-none"
                />
                <span className="text-white font-black text-lg tracking-tighter select-none pointer-events-none">ECELL DYPIU</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-white hover:bg-zinc-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </MotionDiv>

            {/* Links Card */}
            <MotionDiv
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mobile-links-card"
            >
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`mobile-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                >
                  {item.name}
                  <span className="text-zinc-500">→</span>
                </Link>
              ))}

              {currentUser ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className={`mobile-nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
                  >
                    <span className="flex items-center gap-2 text-brand-yellow font-bold">
                      <UserCheck className="w-4 h-4" />
                      My Profile ({userProfile?.name?.split(' ')[0] || 'User'})
                    </span>
                    <span className="text-brand-yellow">→</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="mobile-nav-item w-full text-left text-red-400 font-bold"
                  >
                    <span className="flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      Logout
                    </span>
                    <span className="text-red-400">→</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="mobile-nav-item"
                  >
                    Login
                    <span className="text-zinc-500">→</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="mobile-nav-item text-brand-yellow font-bold"
                  >
                    Join Us
                    <span className="text-brand-yellow">→</span>
                  </Link>
                </>
              )}
            </MotionDiv>
          </MotionDiv>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;