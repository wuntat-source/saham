'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { MentorChatMessage } from '@/types/learning';
import {
  GraduationCap,
  Send,
  Sparkles,
  HelpCircle,
  Brain,
  BookOpen,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';

export default function AIMentorPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MentorChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedTicker, setSelectedTicker] = useState('BBCA');
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const promptStarters = [
    {
      title: 'Validasi Tesis Saham',
      ticker: 'BBCA',
      prompt: 'Saya berencana membeli saham BBCA untuk swing trading. Bagaimana cara memvalidasi tesisnya?',
    },
    {
      title: 'Manajemen Risiko & Cutloss',
      ticker: 'ASII',
      prompt: 'Saya bingung menentukan batas stop loss untuk ASII saat pasar sedang Sideways.',
    },
    {
      title: 'Korelasi Sektor & IHSG',
      ticker: 'TLKM',
      prompt: 'Mengapa saham TLKM tetap turun padahal IHSG sedang Bullish?',
    },
    {
      title: 'Pencegahan Overtrading',
      ticker: 'GOTO',
      prompt: 'Saya sering merasa gatal untuk terus membeli ketika melihat harga naik cepat (FOMO).',
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchHistory = async () => {
    setFetchingHistory(true);
    try {
      const res = await fetch('/api/ai-mentor');
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFetchingHistory(false);
    }
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputMessage;
    if (!textToSend.trim() || loading) return;

    // Optimistic user message
    const tempUserMsg: MentorChatMessage = {
      id: 'temp-' + Date.now(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    if (!customPrompt) setInputMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai-mentor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          ticker: selectedTicker,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
      } else {
        const errorMsg: MentorChatMessage = {
          id: 'err-' + Date.now(),
          role: 'assistant',
          content: 'Maaf, terjadi kendala saat memproses pertanyaan Anda. Silakan coba lagi.',
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4 shadow-2xl">
        <GraduationCap className="w-12 h-12 text-emerald-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Akses AI Mentor EduTradeX</h2>
        <p className="text-sm text-slate-400">
          Silakan masuk terlebih dahulu untuk berdialog dengan AI Mentor Sokratik Anda.
        </p>
        <Link
          href="/login"
          className="inline-block px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition"
        >
          Masuk Akun
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl backdrop-blur">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/20 to-indigo-500/20 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <Brain className="w-7 h-7 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-tight">AI Socratic Mentor</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                Pedagogical Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Mentor AI tidak memberikan sinyal beli/jual instan, melainkan menuntun nalar investasi Anda lewat pertanyaan Sokratik reflektif.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/journal"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Jurnal Trading</span>
          </Link>
          <Link
            href="/learning"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-xl border border-emerald-500/30 transition"
          >
            <GraduationCap className="w-4 h-4 text-emerald-400" />
            <span>Learning Hub</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Quick Starters & Guidelines */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              Topik Sokratik Terpandu
            </h3>
            <div className="space-y-2.5">
              {promptStarters.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedTicker(item.ticker);
                    handleSendMessage(item.prompt);
                  }}
                  className="w-full text-left p-3 rounded-2xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 hover:border-emerald-500/30 transition group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
                      {item.title}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {item.ticker}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {item.prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-teal-400" />
              Filosofi Bimbingan
            </h3>
            <ul className="text-[11px] text-slate-400 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Fokus pada kualitas proses berpikir, bukan sekadar profit/loss sesaat.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Mendorong penulisan jurnal dan pembatasan risiko sebelum entry.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Membantu siswa memahami psikologi pasar dan disiplin trading.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Chat Dialog */}
        <div className="lg:col-span-3 flex flex-col bg-slate-900 border border-slate-800 rounded-3xl h-[650px] overflow-hidden shadow-2xl">
          {/* Chat Header Bar */}
          <div className="px-6 py-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-slate-200">Socratic Chat Session</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-slate-400">Emiten Terkait:</label>
              <select
                value={selectedTicker}
                onChange={(e) => setSelectedTicker(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs font-bold text-emerald-400 rounded-lg px-2.5 py-1 focus:outline-none focus:border-emerald-500"
              >
                <option value="BBCA">BBCA (Bank Central Asia)</option>
                <option value="BBRI">BBRI (Bank Rakyat Indonesia)</option>
                <option value="BMRI">BMRI (Bank Mandiri)</option>
                <option value="TLKM">TLKM (Telkom Indonesia)</option>
                <option value="ASII">ASII (Astra International)</option>
                <option value="UNVR">UNVR (Unilever Indonesia)</option>
                <option value="ICBP">ICBP (Indofood CBP)</option>
                <option value="GOTO">GOTO (GoTo Gojek Tokopedia)</option>
              </select>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {fetchingHistory ? (
              <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                Memuat riwayat bimbingan...
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-emerald-400">
                  <Brain className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Selamat Datang di AI Socratic Mentor!</h4>
                  <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
                    Ajukan pertanyaan seputar rencana trading, manajemen risiko, atau logika di balik keputusan Anda. Mentor akan menuntun Anda berpikir kritis.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => handleSendMessage('Halo Mentor, bagaimana cara memulai evaluasi saham BBCA hari ini?')}
                    className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition"
                  >
                    Mulai Pertanyaan Pertama
                  </button>
                </div>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isAssistant = msg.role === 'assistant';
                return (
                  <div
                    key={msg.id || index}
                    className={`flex items-start gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                  >
                    {isAssistant && (
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed whitespace-pre-line ${
                        isAssistant
                          ? 'bg-slate-950 border border-slate-800 text-slate-200'
                          : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-slate-950 font-medium'
                      }`}
                    >
                      <div>{msg.content}</div>
                      <div
                        className={`text-[9px] mt-2 text-right ${
                          isAssistant ? 'text-slate-500' : 'text-slate-900/60 font-semibold'
                        }`}
                      >
                        {msg.timestamp
                          ? new Date(msg.timestamp).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            {loading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 animate-pulse">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] text-slate-500 ml-1">AI Mentor sedang merumuskan pertanyaan sokratik...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center gap-3"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Tanyakan hipotesis, manajemen risiko, atau emiten yang ingin dianalisis..."
              disabled={loading}
              className="flex-1 bg-slate-900 border border-slate-700/80 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-2xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition"
            >
              <span>Kirim</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
