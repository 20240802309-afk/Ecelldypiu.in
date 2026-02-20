import { motion, AnimatePresence } from 'framer-motion';
import React, { useState } from 'react';

const JoinInfoPopover = ({ href = 'https://forms.gle/Jg2szi9CoK6sNbE97', children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleInteraction = (action) => {
    switch (action) {
      case 'enter':
        setIsOpen(true);
        break;
      case 'leave':
        setIsOpen(false);
        break;
      case 'click':
        setIsOpen((prev) => !prev);
        break;
      default:
        break;
    }
  };

  // Clone the child to attach event handlers directly to the trigger element
  // This prevents the wrapper div from capturing hovers outside the button boundaries
  const trigger = React.cloneElement(children, {
    onMouseEnter: () => handleInteraction('enter'),
    onMouseLeave: () => handleInteraction('leave'),
    onClick: (e) => {
      // Prevent default if necessary, but here we just toggle
      if (children.props.onClick) children.props.onClick(e);
      handleInteraction('click');
    }
  });

  return (
    <div className="relative inline-block">
      {/* Trigger */}
      {trigger}

      {/* Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 z-50 w-72"
            role="tooltip"
          >
            {/* Box */}
            <div className="rounded-xl shadow-2xl bg-white border border-slate-200 p-4 w-full text-slate-800 relative z-10">
              <p className="text-sm font-medium">We are not hiring right now.</p>
              <p className="text-sm mt-1">Want to be the first to hear when we are?</p>
              <p className="text-xs text-slate-500 mt-3">button -</p>
              <p className="text-sm font-semibold mt-1">Join our mailing list below!</p>

              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center justify-center w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors pointer-events-auto"
              >
                Join now
              </a>
            </div>

            {/* Arrow */}
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4 bg-white border-br border-slate-200 rotate-45 transform origin-center z-0 shadow-sm"></div>
            {/* Arrow Cover to hide border if needed, or just let it be. Using simple rotates. */}
            {/* Improved Arrow with border-r and border-b to match shadow direction of box if needed, but simplified: */}
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-white rotate-45 shadow-[2px_2px_2px_-1px_rgba(0,0,0,0.1)]"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JoinInfoPopover;
