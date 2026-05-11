"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, X, Bot, Sparkles, User, Minus } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
};

const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: "Hello! I'm your MatchPoint AI assistant. How can I help you dominate the arena today?",
      timestamp: new Date(),
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simulate AI response for now
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "I'm currently in 'UI-only' mode, but I'll be fully operational soon! Stay tuned for my advanced tournament insights.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[90vw] sm:w-[400px] h-[550px] bg-card/98 backdrop-blur-3xl rounded-[2.5rem] shadow-3d overflow-hidden flex flex-col border border-white/10"
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-accent-blue/20 to-accent-purple/20 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center shadow-lg shadow-accent-blue/20">
                    <Bot className="text-white" size={24} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-background rounded-full" />
                </div>
                <div>
                  <h3 className="font-black tracking-tight text-foreground uppercase italic text-sm">
                    MatchPoint <span className="text-accent-blue">AI</span>
                  </h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center">
                    <Sparkles size={10} className="mr-1 text-accent-purple" /> Online & Ready
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors text-muted-foreground hover:text-foreground"
                >
                  <Minus size={20} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex items-end space-x-2 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse space-x-reverse" : "flex-row"}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${
                      msg.role === "user" 
                        ? "bg-accent-blue/10 text-accent-blue" 
                        : "bg-accent-purple/10 text-accent-purple"
                    }`}>
                      {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`p-4 rounded-[1.5rem] text-[15px] font-medium leading-relaxed tracking-tight shadow-sm ${
                      msg.role === "user"
                        ? "bg-accent-blue text-white rounded-br-none shadow-blue-500/20"
                        : "bg-white/5 backdrop-blur-md text-foreground rounded-bl-none border border-white/10"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-6 bg-white/5 border-t border-white/5">
              <div className="relative group">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about tournaments, cards, or stats..."
                  className="w-full bg-background/50 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue/50 transition-all placeholder:text-muted-foreground/50"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple text-white flex items-center justify-center shadow-lg shadow-accent-blue/20 disabled:opacity-50 disabled:shadow-none hover:scale-105 active:scale-95 transition-all"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="mt-3 text-[9px] text-center font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40">
                Powered by MatchPoint Intelligence
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-purple text-white flex items-center justify-center shadow-3d glow-blue relative overflow-hidden group ${
          isOpen ? "rotate-90" : "rotate-0"
        } transition-transform duration-500`}
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="shimmer-glint absolute inset-0" />
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </motion.button>
    </div>
  );
};

export default AIChat;
