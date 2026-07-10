import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Sparkles, Minimize2 } from 'lucide-react';
import api from '@/api/axios';
import { cn } from '@/utils/cn';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_PROMPTS = [
  'Plan a 5-day trip to Goa under ₹30,000',
  'Best time to visit Manali?',
  'Create a packing list for a beach trip',
  'Budget-friendly hotels in Jaipur',
];

function renderMarkdown(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');
}

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I\'m your **TripWise AI Travel Assistant**. I can help you plan trips, suggest destinations, create itineraries, and more. What adventure shall we plan today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/ai/chat', {
        message: text,
        history: messages.slice(-6),
      });
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, the AI service is temporarily unavailable. Please check that your Gemini API key is configured in `server/.env`.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => { setOpen(true); setMinimized(false); }}
        className={cn(
          'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-indigo-600 text-white shadow-xl flex items-center justify-center',
          open && !minimized ? 'opacity-0 pointer-events-none' : 'opacity-100'
        )}
      >
        <Sparkles size={24} />
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-24px)]"
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
              style={{ height: minimized ? 'auto' : '540px' }}>
              {/* Header */}
              <div className="bg-indigo-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Bot size={16} className="text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">TripWise AI</div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-xs text-indigo-200">Online</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setMinimized(m => !m)} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                    <Minimize2 size={14} />
                  </button>
                  <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              </div>

              {!minimized && (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn('flex gap-2.5', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                      >
                        {msg.role === 'assistant' && (
                          <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Bot size={14} className="text-indigo-600 dark:text-indigo-400" />
                          </div>
                        )}
                        <div className={cn(
                          'max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed',
                          msg.role === 'user'
                            ? 'bg-indigo-600 text-white rounded-tr-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-sm'
                        )}>
                          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                        </div>
                        {msg.role === 'user' && (
                          <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <User size={14} className="text-white" />
                          </div>
                        )}
                      </motion.div>
                    ))}

                    {/* Typing indicator */}
                    {loading && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                          <Bot size={14} className="text-indigo-600" />
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-800 px-3.5 py-3 rounded-2xl rounded-tl-sm">
                          <div className="flex gap-1">
                            {[0, 1, 2].map(i => (
                              <motion.div
                                key={i}
                                animate={{ y: [0, -4, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                                className="w-1.5 h-1.5 rounded-full bg-slate-400"
                              />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Suggested prompts */}
                  {messages.length <= 1 && (
                    <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
                      {SUGGESTED_PROMPTS.map((p, i) => (
                        <button
                          key={i}
                          onClick={() => sendMessage(p)}
                          className="flex-shrink-0 text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-full hover:bg-indigo-100 hover:text-indigo-700 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 transition-colors"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Input */}
                  <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2">
                      <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
                        placeholder="Ask me anything about travel..."
                        className="flex-1 bg-transparent text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none"
                      />
                      <button
                        onClick={() => sendMessage(input)}
                        disabled={!input.trim() || loading}
                        className="w-8 h-8 rounded-lg bg-indigo-600 disabled:opacity-40 flex items-center justify-center text-white hover:bg-indigo-700 transition-colors flex-shrink-0"
                      >
                        <Send size={14} />
                      </button>
                    </div>
                    <p className="text-center text-xs text-slate-400 mt-2">Powered by Gemini AI</p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
