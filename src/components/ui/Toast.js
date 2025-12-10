'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Toast({ message, isVisible, onClose, duration = 3000 }) {
    const onCloseRef = useRef(onClose);

    // Keep the ref updated
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (isVisible && duration > 0) {
            const timer = setTimeout(() => {
                onCloseRef.current();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [isVisible, duration]); // Removed onClose from dependencies

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    transition={{ duration: 0.3 }}
                    className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-[0_0_30px_rgba(249,115,22,0.5)] border border-orange-400/30 backdrop-blur-sm"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <p className="font-medium text-lg">{message}</p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
