"use client";

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import FloatingButton from '@/components/chatbot/FloatingButton';
import ChatWidget from '@/components/chatbot/ChatWidget';

export default function ChatbotFloat() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Show tooltip after 3 seconds on page load
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const toggleChat = () => {
    setIsChatOpen((prev) => {
      const next = !prev;
      if (next) setShowTooltip(false);
      return next;
    });
  };

  return (
    <>
      {/* CHAT WIDGET OVERLAY */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div className="fixed bottom-24 right-6 z-[9999] pointer-events-auto">
            <ChatWidget onClose={() => setIsChatOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING ACTION BUTTON */}
      <div className="fixed bottom-6 right-6 z-50 pointer-events-auto">
        <div className="relative">
          {/* Welcome Tooltip bubble */}
          <AnimatePresence>
            {!isChatOpen && showTooltip && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: [0, -4, 0],
                }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                transition={{
                  y: {
                    repeat: Infinity,
                    duration: 2.5,
                    ease: 'easeInOut',
                  },
                  default: { duration: 0.3 },
                }}
                className="absolute bottom-[72px] right-0 bg-[#1A160A] text-white rounded-2xl shadow-[0_10px_25px_rgba(26,22,10,0.2)] border border-[#C9A84C] w-64 flex flex-col items-start gap-1 text-sm font-sans"
                style={{ 
                  transformOrigin: 'bottom right',
                  padding: '16px 20px'
                }}
              >
                {/* Close button */}
                <button
                  onClick={() => setShowTooltip(false)}
                  className="absolute top-2.5 right-2.5 text-[#FAF6F0]/70 hover:text-[#FAF6F0] transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>

                <div className="font-semibold text-[#FAF6F0] flex items-center gap-1.5">
                  <span>Ask CareerAI ✨</span>
                </div>
                <p className="text-slate-200 text-xs pr-2 leading-normal">
                  Need career advice? Ask me about Internships, OJT, or Job Ready Programs! 🚀
                </p>

                {/* Tooltip Arrow pointing down */}
                <div className="absolute right-6 -bottom-1.5 w-3 h-3 bg-[#1A160A] border-r border-b border-[#C9A84C] rotate-45" />
              </motion.div>
            )}
          </AnimatePresence>

          <FloatingButton isOpen={isChatOpen} toggle={toggleChat} />
        </div>
      </div>
    </>
  );
}
