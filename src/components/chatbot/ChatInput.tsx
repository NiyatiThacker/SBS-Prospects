"use client";

import { useState, useRef, useEffect } from 'react';
import { ArrowUp, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export default function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput('');
    }
  };

  // Auto-focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div 
      style={{ padding: '12px 20px 16px 20px' }}
      className="bg-white shrink-0 rounded-b-[22px] border-t border-slate-100"
    >
      <form onSubmit={handleSubmit} className="relative flex items-center mb-2.5">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Type your message..."
          style={{
            width: '100%',
            backgroundColor: '#f8fafc',
            border: isFocused ? '1px solid #C9A84C' : '1px solid #e2e8f0',
            borderRadius: '9999px',
            paddingLeft: '20px',
            paddingRight: '48px',
            paddingTop: '12px',
            paddingBottom: '12px',
            fontSize: '14px',
            color: '#1e293b',
            outline: 'none',
            boxShadow: isFocused ? '0 0 0 2px rgba(201, 168, 76, 0.2)' : 'inset 0 1px 2px rgba(0,0,0,0.02)',
            transition: 'all 0.2s',
            opacity: isLoading ? 0.5 : 1
          }}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          style={{ 
            cursor: (!input.trim() || isLoading) ? 'default' : 'pointer'
          }}
          className="absolute right-1.5 bg-[#C9A84C] text-white rounded-full w-[34px] h-[34px] flex items-center justify-center hover:bg-[#7A6A1E] hover:shadow-md disabled:opacity-50 disabled:hover:bg-[#C9A84C] disabled:hover:shadow-none transition-all"
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin text-white" />
          ) : (
            <ArrowUp size={20} className="stroke-[2.5]" />
          )}
        </button>
      </form>
      <div className="text-center text-[10px] text-slate-400 font-medium tracking-wide flex items-center justify-center gap-1.5">
        <span className="w-2 h-2 rounded-full border border-slate-300"></span>
        Your data is secure and encrypted
      </div>
    </div>
  );
}
