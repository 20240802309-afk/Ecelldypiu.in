import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (location.pathname === '/ourlinks') return null;

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Sponsors', path: '/sponsors' },
    { name: 'Events', path: '/events' },
    { name: 'Team', path: '/team' },
    { name: 'Blogs', path: '/blogs' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "circOut" }}
        className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-[95%] max-w-5xl"
      >
        <div className="bg-black/80 backdrop-blur-md border border-brand-yellow rounded-full px-6 py-3 shadow-[0_0_30px_rgba(255,178,44,0.6),0_0_60px_rgba(255,178,44,0.3)] flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 flex-shrink-0">
            <img
              src="/logonew.png"
              alt="E-Cell"
              className="h-10 w-auto object-contain brightness-0 invert"
            />
            <span className="text-white font-black text-xl tracking-tighter block">ECELL DYPIU</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 bg-white/5 rounded-full px-2 py-1 ml-4 border border-white/10">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`relative px-5 py-2.5 text-sm font-bold uppercase tracking-wide transition-all duration-300 rounded-full ${location.pathname === item.path
                  ? 'text-black bg-brand-yellow shadow-[0_0_10px_rgba(255,178,44,0.5)]'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:block ml-4">
            <Link to="/contact" className="bg-white text-black px-6 py-3 rounded-full font-bold text-sm hover:bg-brand-yellow hover:text-black transition-all duration-300 border-2 border-transparent uppercase tracking-wider shadow-glow-white whitespace-nowrap">
              Let's Talk
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="block md:hidden text-white p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <div className="w-6 h-5 flex flex-col justify-between items-center relative">
              <motion.span
                animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                className="w-full h-0.5 bg-white block origin-center transition-transform"
              />
              <motion.span
                animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
                className="w-full h-0.5 bg-white block transition-opacity"
              />
              <motion.span
                animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                className="w-full h-0.5 bg-white block origin-center transition-transform"
              />
            </div>
          </button>
        </div>
      </motion.nav>

      {/* Mobile Navigation Overlay */}
      {/* Mobile Navigation Overlay - MindMarket Style */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mobile-menu-overlay md:hidden"
          >
            {/* 1. Header Card (Logo + Close) */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mobile-header-card"
            >
              <div className="flex items-center space-x-3">
                <img
                  src="/logonew.png"
                  alt="E-Cell"
                  className="h-8 w-auto object-contain brightness-0 invert"
                />
                <span className="text-white font-black text-lg tracking-tighter">ECELL DYPIU</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-white hover:bg-zinc-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>

            {/* 2. Links Card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mobile-links-card"
            >
              {navItems.map((item, index) => (
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
            </motion.div>

            {/* 3. Contact Card (Bottom) */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mobile-contact-card"
            >
              <Link to="/contact" onClick={() => setIsOpen(false)} className="mobile-contact-btn">
                <span>Let's Talk</span>
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
                  <span className="text-sm">↗</span>
                </div>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;