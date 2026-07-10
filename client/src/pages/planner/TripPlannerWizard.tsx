import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  options?: string[];
  inputType?: 'text' | 'number' | 'none';
}

export default function TripPlannerWizard() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Hi! I'm TripWise AI, your personal travel planner. Where would you like to travel?",
      inputType: 'text',
      options: ['Goa', 'Manali', 'Kerala', 'Dubai', 'Bali']
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    source: 'New Delhi',
    destination: '',
    days: 3,
    travelers: 2,
    budget: 'Moderate',
    interests: ['Sightseeing']
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleNextStep = (userInput: string) => {
    const newMessages = [...messages, { id: Date.now().toString(), sender: 'user' as const, text: userInput }];
    
    // Update formData based on current step
    const updatedData = { ...formData };
    if (currentStep === 0) updatedData.destination = userInput;
    if (currentStep === 1) updatedData.days = parseInt(userInput) || 3;
    if (currentStep === 2) updatedData.travelers = parseInt(userInput) || 2;
    if (currentStep === 3) updatedData.budget = userInput;
    setFormData(updatedData);

    setMessages(newMessages);
    setInputValue('');

    // AI Response logic
    setTimeout(() => {
      let nextAiMsg: Message;
      
      if (currentStep === 0) {
        nextAiMsg = {
          id: Date.now().toString() + 1,
          sender: 'ai',
          text: `Awesome! ${userInput} is a great choice. How many days are you planning to stay?`,
          inputType: 'number',
          options: ['3', '5', '7']
        };
        setCurrentStep(1);
      } else if (currentStep === 1) {
        nextAiMsg = {
          id: Date.now().toString() + 1,
          sender: 'ai',
          text: `Got it, ${userInput} days. Who is traveling with you?`,
          inputType: 'none',
          options: ['1 (Solo)', '2 (Couple)', '3 (Family)', '4+ (Group)']
        };
        setCurrentStep(2);
      } else if (currentStep === 2) {
        nextAiMsg = {
          id: Date.now().toString() + 1,
          sender: 'ai',
          text: `Perfect. What's your estimated budget style?`,
          inputType: 'none',
          options: ['Budget', 'Moderate', 'Luxury']
        };
        setCurrentStep(3);
      } else if (currentStep === 3) {
        nextAiMsg = {
          id: Date.now().toString() + 1,
          sender: 'ai',
          text: `Great! Give me a few seconds to craft a personalized itinerary for your trip to ${updatedData.destination}...`,
          inputType: 'none'
        };
        setCurrentStep(4);
        
        // Final Submit
        setTimeout(() => {
          localStorage.setItem('trip_planner_data', JSON.stringify(updatedData));
          navigate('/planner/itinerary');
        }, 1500);
      }
      
      setMessages(prev => [...prev, nextAiMsg]);
    }, 600);
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;
    
    // For step 2, extract the number if they typed it
    let val = inputValue;
    if (currentStep === 2) {
      if (val.toLowerCase().includes('solo') || val === '1') val = '1';
      else if (val.toLowerCase().includes('couple') || val === '2') val = '2';
      else if (val.includes('3')) val = '3';
      else val = '4';
    }
    
    handleNextStep(val);
  };

  const currentInputType = messages[messages.length - 1]?.inputType || 'none';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col pt-20">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 sticky top-16 z-20 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-white">TripWise AI</h1>
            <p className="text-xs text-slate-500">Always online to help you plan</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-32">
        <div className="max-w-3xl mx-auto space-y-6">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                  msg.sender === 'ai' ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}>
                  {msg.sender === 'ai' ? <Bot size={16} /> : <User size={16} />}
                </div>
                
                <div className="max-w-[80%]">
                  <div className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                    msg.sender === 'ai' 
                      ? 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none' 
                      : 'bg-indigo-600 text-white rounded-tr-none'
                  }`}>
                    {msg.text}
                  </div>
                  
                  {/* Suggestion Chips */}
                  {msg.sender === 'ai' && msg.options && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {msg.options.map(opt => (
                        <button
                          key={opt}
                          onClick={() => handleNextStep(opt)}
                          disabled={currentStep > (messages.indexOf(msg)/2)} // disable old chips
                          className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                            currentStep > (messages.indexOf(msg)/2)
                            ? 'border-slate-200 text-slate-400 opacity-50 cursor-not-allowed'
                            : 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {currentStep === 4 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center py-8">
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      {currentStep < 4 && currentInputType !== 'none' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 pb-8 z-20">
          <div className="max-w-3xl mx-auto relative">
            <form onSubmit={handleSend} className="relative flex items-center">
              <input
                type={currentInputType === 'number' ? 'number' : 'text'}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={currentInputType === 'number' ? "Type a number..." : "Type your answer..."}
                className="w-full pl-6 pr-14 py-4 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-white shadow-inner"
                autoFocus
              />
              <button 
                type="submit"
                disabled={!inputValue.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center disabled:opacity-50 hover:bg-indigo-700 transition-colors"
              >
                <Send size={18} className="ml-1" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
