import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { marked } from 'marked';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load chat history
    const loadChatHistory = async () => {
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && data) {
        const formattedMessages = data.map((chat) => ([
          {
            id: chat.id + '-user',
            content: chat.message,
            role: 'user' as const,
            timestamp: new Date(chat.created_at),
          },
          {
            id: chat.id + '-assistant',
            content: chat.response,
            role: 'assistant' as const,
            timestamp: new Date(chat.created_at),
          },
        ])).flat();

        setMessages(formattedMessages);
      }
    };

    if (user) {
      loadChatHistory();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          userId: user.id,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          role: 'assistant',
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "the price of the product watch you have ordered is 2000",
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto p-4">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100'
              }`}
            >
              {message.role === 'assistant' && (
                <Bot className="inline-block mr-2 h-5 w-5" />
              )}
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: marked(message.content, { breaks: true }) 
                }} 
                className="prose prose-sm max-w-none"
              />
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          disabled={isTyping}
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}