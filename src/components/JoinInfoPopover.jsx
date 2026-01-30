import { motion } from 'framer-motion';

const JoinInfoPopover = ({ href = 'https://forms.gle/Jg2szi9CoK6sNbE97', children }) => {
  return (
    <div className="relative inline-block group">
      {/* Trigger */}
      {children}

      {/* Popover */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 6 }}
        whileHover={{ opacity: 1, scale: 1, y: 0 }}
        whileFocus={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:scale-100 group-focus-within:pointer-events-auto"
        role="tooltip"
      >
        {/* Box */}
        <div className="rounded-xl shadow-2xl bg-white border border-slate-200 p-4 w-72 text-slate-800">
          <p className="text-sm font-medium">We are not hiring right now.</p>
          <p className="text-sm mt-1">Want to be the first to hear when we are?</p>
          <p className="text-xs text-slate-500 mt-3">button -</p>
          <p className="text-sm font-semibold mt-1">Join our mailing list below!</p>

          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center justify-center w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Join now
          </a>
        </div>
        {/* Arrow */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-3 h-3 bg-white border-l border-t border-slate-200 rotate-45"></div>
      </motion.div>
    </div>
  );
};

export default JoinInfoPopover;
