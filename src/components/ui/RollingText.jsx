import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, useAnimationControls, useInView } from 'framer-motion';
import './RollingText.css';

const RollingTextPiece = ({ piece, index, triggerRoll }) => {
    const controls = useAnimationControls();
    const isAnimating = useRef(false);
    const isMounted = useRef(false);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    const roll = async () => {
        if (isAnimating.current || !isMounted.current) return;
        isAnimating.current = true;

        // Ensure Framer Motion has fully bound the element before starting
        await new Promise(r => requestAnimationFrame(r));
        if (!isMounted.current) { isAnimating.current = false; return; }

        try {
            await controls.start({
                y: "-50%",
                transition: { duration: 0.3, ease: "circOut" }
            });
            await controls.start({
                y: "0%",
                transition: { duration: 0.3, ease: "circOut", delay: 0.05 }
            });
        } catch (e) {
            // Ignore error if component unmounts during animation
        }

        isAnimating.current = false;
    };

    useEffect(() => {
        if (triggerRoll > 0) {
            const timeout = setTimeout(roll, index * 25);
            return () => clearTimeout(timeout);
        }
    }, [triggerRoll]);

    return (
        <span className="rolling-piece-wrapper">
            <span className="char-outer">
                <motion.span
                    animate={controls}
                    initial={{ y: "0%" }}
                    className="char-inner"
                >
                    <span className="char-item" aria-hidden="true">
                        {piece === " " ? "\u00A0" : piece}
                    </span>
                    <span className="char-item" aria-hidden="true">
                        {piece === " " ? "\u00A0" : piece}
                    </span>
                </motion.span>
            </span>
        </span>
    );
};

const RollingText = ({ text, hover }) => {
    const [triggerTs, setTriggerTs] = useState(0);
    const pieces = useMemo(() => text.split(""), [text]);
    const isPreviouslyHovered = useRef(false);
    const isRolling = useRef(false);
    const containerRef = useRef(null);
    const glowControls = useAnimationControls();
    const isMounted = useRef(false);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    // Mobile optimization: Trigger when scrolled into view
    const isInView = useInView(containerRef, { once: false, amount: 0.5 });
    const hasTriggeredInView = useRef(false);

    const triggerFullRoll = async () => {
        if (isRolling.current || !isMounted.current) return;
        isRolling.current = true;

        // Start text animation
        setTriggerTs(Date.now());

        // Delay glow sweep to ensure controls are ready after mount
        await new Promise(r => requestAnimationFrame(r));
        if (!isMounted.current) { isRolling.current = false; return; }

        // Start synchronized glow sweep
        const totalDuration = (pieces.length * 0.025) + 0.4; // Stagger + roll duration
        try {
            glowControls.set({ opacity: 0.6, left: "-20%" });
            await glowControls.start({
                left: "120%",
                transition: { duration: totalDuration, ease: "linear" }
            });
            if (isMounted.current) await glowControls.start({ opacity: 0 });
        } catch (e) {
            // Ignore animation errors if component unmounted
        }

        isRolling.current = false;
    };

    useEffect(() => {
        if (hover && !isPreviouslyHovered.current) {
            triggerFullRoll();
        }
        isPreviouslyHovered.current = hover;
    }, [hover, pieces]);

    // Mobile scroll trigger
    useEffect(() => {
        if (isInView && !hasTriggeredInView.current) {
            triggerFullRoll();
            hasTriggeredInView.current = true;
        } else if (!isInView) {
            hasTriggeredInView.current = false;
        }
    }, [isInView]);

    return (
        <div
            ref={containerRef}
            className="rolling-container relative px-2"
            aria-label={text}
            onMouseEnter={triggerFullRoll}
            onMouseLeave={triggerFullRoll}
            onTouchStart={triggerFullRoll}
        >
            {/* Synchronized Glow Effect */}
            <motion.div
                animate={glowControls}
                initial={{ opacity: 0, left: "-20%" }}
                className="rolling-glow"
            />

            {pieces.map((piece, index) => (
                <RollingTextPiece
                    key={index}
                    piece={piece}
                    index={index}
                    triggerRoll={triggerTs}
                />
            ))}
        </div>
    );
};

export default RollingText;
