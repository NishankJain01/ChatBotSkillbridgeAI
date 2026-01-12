
import React, { useState, useEffect, useRef } from 'react';
import { SKILLS } from './constants';
import { Skill, Message, UserProgress, Difficulty, Topic } from './types';
import { gemini } from './services/geminiService';

// --- Helper for Markdown Rendering ---
declare const marked: any;
declare const hljs: any;

const MarkdownContent: React.FC<{ content: string }> = ({ content }) => {
  const [html, setHtml] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (content) {
      const rawHtml = marked.parse(content);
      setHtml(rawHtml);
    }
  }, [content]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
      });
    }
  }, [html]);

  return (
    <div 
      ref={containerRef}
      className="prose prose-slate max-w-none text-inherit prose-invert-0"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

const ProgressRing: React.FC<{ percentage: number }> = ({ percentage }) => {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="w-14 h-14 transform -rotate-90">
        <circle className="text-slate-200" strokeWidth="4" stroke="currentColor" fill="transparent" r={radius} cx="28" cy="28" />
        <circle className="text-blue-600 transition-all duration-700" strokeWidth="4" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" stroke="currentColor" fill="transparent" r={radius} cx="28" cy="28" />
      </svg>
      <span className="absolute text-[10px] font-bold text-slate-700">{Math.round(percentage)}%</span>
    </div>
  );
};

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('sb_progress');
    return saved ? JSON.parse(saved) : {
      selectedSkillId: null,
      difficulty: null,
      completedTopicIds: [],
    };
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: "# Welcome to Skill Bridge AI!\n\nI'm your intelligent personal mentor. You can ask me **anything**—from debugging complex code to explaining how the universe works.\n\nWant to start a specific learning track? Select one from the sidebar, or just start typing!",
      timestamp: new Date()
    }
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('sb_progress', JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const currentSkill = SKILLS.find(s => s.id === progress.selectedSkillId);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input;
    const userMessage: Message = { role: 'user', text: userText, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const responseText = await gemini.generateResponse([...messages, userMessage], progress, currentSkill);

    setMessages(prev => [...prev, { role: 'model', text: responseText, timestamp: new Date() }]);
    setIsTyping(false);
  };

  const selectSkill = (skillId: string) => {
    const skill = SKILLS.find(s => s.id === skillId);
    setProgress(prev => ({ ...prev, selectedSkillId: skillId }));
    
    setMessages(prev => [...prev, {
      role: 'model',
      text: `### Now Tracking: ${skill?.name}\nGreat! I've activated the ${skill?.name} curriculum for you. You can see your progress in the sidebar. What's the first thing you'd like to dive into?`,
      timestamp: new Date()
    }]);
    
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const toggleTopic = (topicId: string) => {
    setProgress(prev => {
      const isCompleted = prev.completedTopicIds.includes(topicId);
      const newIds = isCompleted ? prev.completedTopicIds.filter(id => id !== topicId) : [...prev.completedTopicIds, topicId];
      return { ...prev, completedTopicIds: newIds };
    });
  };

  const progressPercentage = currentSkill ? (progress.completedTopicIds.length / currentSkill.topics.length) * 100 : 0;

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-20 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-80 bg-slate-50 border-r border-slate-200 flex flex-col transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:hidden'}`}>
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">SB</div>
            <span className="font-bold text-slate-800 tracking-tight">Learning Hub</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
          <div>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Skill Tracks</h3>
            <div className="space-y-1">
              {SKILLS.map(skill => (
                <button
                  key={skill.id}
                  onClick={() => selectSkill(skill.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                    progress.selectedSkillId === skill.id 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                      : 'hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  <span className="text-xl">{skill.icon}</span>
                  <span className="font-medium text-sm">{skill.name}</span>
                </button>
              ))}
            </div>
          </div>

          {currentSkill && (
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-4 px-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Progress</span>
                <span className="text-xs font-bold text-blue-600">{Math.round(progressPercentage)}%</span>
              </div>
              <div className="space-y-2">
                {currentSkill.topics.map(topic => (
                  <div 
                    key={topic.id}
                    onClick={() => toggleTopic(topic.id)}
                    className={`group flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      progress.completedTopicIds.includes(topic.id)
                        ? 'bg-green-50 border-green-100 text-green-700'
                        : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      progress.completedTopicIds.includes(topic.id) ? 'bg-green-500 border-green-500' : 'border-slate-300'
                    }`}>
                      {progress.completedTopicIds.includes(topic.id) && (
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>
                      )}
                    </div>
                    <span className="text-xs font-medium truncate">{topic.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative bg-white">
        {/* Navigation Bar */}
        <nav className="h-16 border-b border-slate-100 flex items-center px-6 justify-between bg-white/90 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
            )}
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-800">Skill Bridge AI</span>
              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-tighter">Gemini 3 Pro</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {currentSkill && (
              <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{currentSkill.name}</span>
                <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${progressPercentage}%` }} />
                </div>
              </div>
            )}
            <button className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </button>
          </div>
        </nav>

        {/* Message Container */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto custom-scrollbar bg-white"
        >
          <div className="max-w-4xl mx-auto p-6 space-y-10">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex gap-4 sm:gap-6 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}
              >
                {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-lg shadow-blue-100">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                )}
                
                <div className={`flex flex-col gap-1 max-w-[90%] sm:max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-5 rounded-2xl shadow-sm border ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 border-blue-500 text-white rounded-tr-none' 
                      : 'bg-slate-50 border-slate-100 text-slate-800 rounded-tl-none'
                  }`}>
                    <MarkdownContent content={msg.text} />
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 mt-1 px-1 uppercase">
                    {msg.role === 'user' ? 'You' : 'Skill Bridge'} • {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-500 shrink-0 mt-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 animate-pulse">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div className="flex gap-1 bg-slate-50 p-4 rounded-xl">
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating Input Area */}
        <div className="p-4 sm:p-8 bg-gradient-to-t from-white via-white to-transparent">
          <div className="max-w-4xl mx-auto relative">
            <form 
              onSubmit={handleSendMessage}
              className="group bg-slate-50 border border-slate-200 rounded-3xl p-2 pl-4 pr-3 flex items-end gap-2 transition-all shadow-xl shadow-slate-200/50 focus-within:ring-4 focus-within:ring-blue-100 focus-within:border-blue-400"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Message Skill Bridge AI..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-slate-700 py-3 text-base resize-none min-h-[52px] max-h-48"
                rows={1}
                autoFocus
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-30 disabled:grayscale text-white w-10 h-10 rounded-2xl transition-all flex items-center justify-center shrink-0 mb-1 active:scale-95"
              >
                <svg className="w-5 h-5 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
            <p className="text-[10px] text-center text-slate-400 mt-4 font-semibold tracking-widest uppercase">
              Free Research Preview. AI can make mistakes.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
