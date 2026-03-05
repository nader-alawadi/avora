"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import React from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface UserContext {
  firstName: string;
  fullName: string;
  email: string;
  plan: string;
  companyName: string;
  industry: string;
  icpTitle: string;
  topIndustries: string[];
  offer: string;
  problem: string;
  geoTargets: string;
  outreachFocus: string;
  abmTier1: string;
  hasReport: boolean;
  reportVersion: number;
  icpConfidence: number;
  dmuConfidence: number;
}

// ─── Markdown renderer ────────────────────────────────────────────────────────

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={i}>{part.slice(1, -1)}</em>;
    if (part.startsWith("`") && part.endsWith("`"))
      return <code key={i} className="bg-black/10 rounded px-1 text-xs font-mono">{part.slice(1, -1)}</code>;
    return part;
  });
}

function isTableRow(line: string) {
  return line.trim().startsWith("|") && line.trim().endsWith("|");
}
function isTableSeparator(line: string) {
  return isTableRow(line) && /^\|[\s|:-]+\|$/.test(line.trim());
}
function parseTableCells(line: string): string[] {
  return line.trim().slice(1, -1).split("|").map((c) => c.trim());
}

function MarkdownMessage({ content, isUser }: { content: string; isUser: boolean }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let bulletBuffer: string[] = [];
  let orderedBuffer: string[] = [];
  let tableBuffer: string[] = [];
  let key = 0;

  const flushBullets = () => {
    if (bulletBuffer.length) {
      elements.push(
        <ul key={key++} className="list-disc list-outside pl-4 space-y-0.5 my-1">
          {bulletBuffer.map((item, i) => (
            <li key={i} className="leading-snug">{renderInline(item)}</li>
          ))}
        </ul>
      );
      bulletBuffer = [];
    }
  };
  const flushOrdered = () => {
    if (orderedBuffer.length) {
      elements.push(
        <ol key={key++} className="list-decimal list-outside pl-4 space-y-0.5 my-1">
          {orderedBuffer.map((item, i) => (
            <li key={i} className="leading-snug">{renderInline(item)}</li>
          ))}
        </ol>
      );
      orderedBuffer = [];
    }
  };
  const flushTable = () => {
    if (tableBuffer.length < 2) {
      // Not enough for a real table — render as plain text
      tableBuffer.forEach((l) => elements.push(<p key={key++} className="leading-relaxed">{renderInline(l)}</p>));
      tableBuffer = [];
      return;
    }
    const rows = tableBuffer.filter((l) => !isTableSeparator(l));
    const headerCells = parseTableCells(rows[0]);
    const bodyRows = rows.slice(1);
    elements.push(
      <div key={key++} className="overflow-x-auto my-2 rounded-lg border border-gray-200">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-[#1a5c4a]">
              {headerCells.map((cell, ci) => (
                <th key={ci} className="text-white font-semibold px-3 py-2 text-left whitespace-nowrap">{renderInline(cell)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bodyRows.map((row, ri) => (
              <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                {parseTableCells(row).map((cell, ci) => (
                  <td key={ci} className="px-3 py-2 border-t border-gray-100 text-[#1F2A2A]">{renderInline(cell)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableBuffer = [];
  };
  const flush = () => { flushBullets(); flushOrdered(); flushTable(); };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (isTableRow(line)) {
      flushBullets();
      flushOrdered();
      tableBuffer.push(line);
      continue;
    } else if (tableBuffer.length > 0) {
      flushTable();
    }

    if (/^### /.test(line)) {
      flush();
      elements.push(<p key={key++} className={`font-semibold text-xs uppercase tracking-wide mt-2.5 mb-0.5 ${isUser ? "text-white/80" : "text-[#1a5c4a]"}`}>{renderInline(line.slice(4))}</p>);
    } else if (/^## /.test(line)) {
      flush();
      elements.push(<p key={key++} className={`font-bold text-sm mt-3 mb-1 ${isUser ? "text-white" : "text-[#1F2A2A]"}`}>{renderInline(line.slice(3))}</p>);
    } else if (/^# /.test(line)) {
      flush();
      elements.push(<p key={key++} className={`font-bold text-sm mt-3 mb-1 ${isUser ? "text-white" : "text-[#1F2A2A]"}`}>{renderInline(line.slice(2))}</p>);
    } else if (/^[-*] /.test(line)) {
      flushOrdered();
      bulletBuffer.push(line.slice(2));
    } else if (/^\d+\. /.test(line)) {
      flushBullets();
      orderedBuffer.push(line.replace(/^\d+\. /, ""));
    } else if (line.trim() === "---" || line.trim() === "***") {
      flush();
      elements.push(<hr key={key++} className={`my-2 ${isUser ? "border-white/20" : "border-gray-200"}`} />);
    } else if (line.trim() === "") {
      flush();
      if (i < lines.length - 1) elements.push(<div key={key++} className="h-1.5" />);
    } else {
      flush();
      elements.push(<p key={key++} className="leading-relaxed">{renderInline(line)}</p>);
    }
  }
  flush();
  return <div className="text-sm space-y-0">{elements}</div>;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ─── Contact Page ─────────────────────────────────────────────────────────────

export default function ContactPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [contextLoading, setContextLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch user context (silently — works for logged-in and anonymous users)
  useEffect(() => {
    fetch("/api/contact/context")
      .then((r) => r.json())
      .then(({ user }) => {
        setUserContext(user || null);
        setContextLoading(false);
      })
      .catch(() => setContextLoading(false));
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Welcome message after context loads
  useEffect(() => {
    if (contextLoading) return;
    if (messages.length > 0) return;

    let welcome: string;
    if (userContext) {
      const companyRef = userContext.companyName ? ` at ${userContext.companyName}` : "";
      const icpRef = userContext.hasReport && userContext.icpTitle ? ` I can see you're targeting **${userContext.icpTitle}**.` : "";
      welcome = `Hey ${userContext.firstName} 👋 I'm Aria — your GTM consultant${companyRef}.${icpRef}\n\nWhat's the biggest challenge in your pipeline right now?`;
    } else {
      welcome = `Hey 👋 I'm **Aria** — GTM consultant at AVORA.\n\nWhat are you trying to figure out today?`;
    }

    setMessages([{ role: "assistant", content: welcome }]);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [contextLoading, userContext, messages.length]);

  // Dynamic chips based on login state
  const chips = userContext
    ? [
        "Build my LinkedIn campaign",
        "Find target companies",
        "Review my outreach strategy",
        "Analyze my ICP",
        "What should I focus on this month?",
      ]
    : [
        "What does AVORA do?",
        "LITE vs PLUS plan?",
        "How do I order leads?",
        "What is the DMU Map?",
        "Build a LinkedIn campaign",
      ];

  const sendMessage = useCallback(
    async (text?: string) => {
      const userText = text ?? input.trim();
      if (!userText || streaming) return;

      const newMessages: Message[] = [
        ...messages,
        { role: "user", content: userText },
      ];
      setMessages(newMessages);
      setInput("");
      setStreaming(true);

      const assistantIdx = newMessages.length;
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      try {
        const res = await fetch("/api/contact/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: newMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            userContext: userContext ?? undefined,
          }),
        });

        if (!res.body) throw new Error("No response body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let accumulated = "";
        let done = false;

        while (!done) {
          const { done: streamDone, value } = await reader.read();
          if (streamDone) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") { done = true; break; }
            try {
              const parsed = JSON.parse(data);
              accumulated += parsed.text;
              setMessages((prev) => {
                const updated = [...prev];
                updated[assistantIdx] = { role: "assistant", content: accumulated };
                return updated;
              });
            } catch { /* ignore */ }
          }
        }
      } catch {
        setMessages((prev) => {
          const updated = [...prev];
          updated[assistantIdx] = {
            role: "assistant",
            content: "Sorry, I'm having trouble connecting right now. Please reach out via WhatsApp or email instead.",
          };
          return updated;
        });
      } finally {
        setStreaming(false);
      }
    },
    [input, messages, streaming, userContext]
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1a5c4a] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-lg text-[#1F2A2A]">AVORA</span>
            <span className="text-xs text-gray-400 ml-1">by Enigma Sales</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-gray-500 hover:text-[#1a5c4a]">Home</Link>
            {userContext ? (
              <Link href="/dashboard" className="text-sm text-gray-500 hover:text-[#1a5c4a]">
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="text-sm text-gray-500 hover:text-[#1a5c4a]">Sign In</Link>
            )}
            {!userContext && (
              <Link href="/register" className="bg-[#FF6B63] hover:bg-[#e55d55] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                Start Free
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0d3d30] via-[#1a5c4a] to-[#1E6663] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            {userContext ? `Welcome back, ${userContext.firstName}` : "We're here to help"}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Let&apos;s Build Your GTM Engine
          </h1>
          <p className="mt-4 text-lg text-white/70 max-w-xl mx-auto">
            Chat with Aria, our AI GTM mentor — or reach our team via WhatsApp, email, or a strategy call.
          </p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="max-w-5xl mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Aria Card */}
          <button
            onClick={() => document.getElementById("chat-section")?.scrollIntoView({ behavior: "smooth" })}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-left hover:shadow-md hover:border-[#1a5c4a]/30 transition-all group"
          >
            <div className="w-10 h-10 bg-[#1a5c4a]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#1a5c4a]/20 transition-colors">
              <span className="text-[#1a5c4a] font-bold text-lg">A</span>
            </div>
            <h3 className="font-bold text-[#1F2A2A] text-sm">Aria — GTM Mentor</h3>
            <p className="text-gray-500 text-xs mt-1">AI-powered strategy coach. Build campaigns, find leads, get GTM advice.</p>
            <span className="mt-3 inline-flex items-center text-[#1a5c4a] text-xs font-semibold">Chat with Aria →</span>
          </button>

          {/* WhatsApp */}
          <a href="https://wa.me/201011348217" target="_blank" rel="noopener noreferrer"
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-left hover:shadow-md hover:border-green-300 transition-all group">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
              <WhatsAppIcon className="w-5 h-5 text-[#25D366]" />
            </div>
            <h3 className="font-bold text-[#1F2A2A] text-sm">WhatsApp</h3>
            <p className="text-gray-500 text-xs mt-1">Chat with our team. Fastest way to get a payment link or support.</p>
            <span className="mt-3 inline-flex items-center text-green-600 text-xs font-semibold">+20 101 134 8217 →</span>
          </a>

          {/* Email */}
          <a href="mailto:growth@enigmasales.io"
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-left hover:shadow-md hover:border-blue-200 transition-all group">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-bold text-[#1F2A2A] text-sm">Email</h3>
            <p className="text-gray-500 text-xs mt-1">For inquiries, partnerships, or technical support.</p>
            <span className="mt-3 inline-flex items-center text-blue-600 text-xs font-semibold">growth@enigmasales.io →</span>
          </a>

          {/* Book a Call */}
          <button
            onClick={() => document.getElementById("calendar-section")?.scrollIntoView({ behavior: "smooth" })}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-left hover:shadow-md hover:border-[#FF6B63]/30 transition-all group">
            <div className="w-10 h-10 bg-[#FF6B63]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#FF6B63]/20 transition-colors">
              <svg className="w-5 h-5 text-[#FF6B63]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-bold text-[#1F2A2A] text-sm">Book a Call</h3>
            <p className="text-gray-500 text-xs mt-1">Schedule a 30-min strategy session with our GTM team.</p>
            <span className="mt-3 inline-flex items-center text-[#FF6B63] text-xs font-semibold">Pick a time →</span>
          </button>
        </div>
      </section>

      {/* Chat Section */}
      <section id="chat-section" className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#1F2A2A]">Chat with Aria</h2>
          <p className="text-gray-500 text-sm mt-2">
            Your AI GTM mentor — strategy, campaigns, and expert advice in English or Arabic
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0d3d30] to-[#1a5c4a] px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30">
                  <span className="text-white font-bold">Ar</span>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#1a5c4a]" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Aria by AVORA</p>
                <p className="text-white/60 text-xs">GTM Consultant & Mentor · Powered by Claude AI</p>
              </div>
            </div>
            {userContext && (
              <div className="text-right">
                <p className="text-white/70 text-xs">{userContext.firstName}</p>
                <p className="text-white/40 text-xs">{userContext.plan} plan</p>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="h-[440px] overflow-y-auto p-4 space-y-4 bg-gray-50/60">
            {contextLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-[#1a5c4a]/40 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-[#1a5c4a]/40 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-[#1a5c4a]/40 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 bg-[#1a5c4a] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                        <span className="text-white text-xs font-bold">Ar</span>
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                        msg.role === "user"
                          ? "bg-[#1a5c4a] text-white rounded-tr-sm"
                          : "bg-white border border-gray-100 text-[#1F2A2A] rounded-tl-sm"
                      }`}
                    >
                      {msg.content === "" ? (
                        <span className="flex gap-1 items-center py-0.5">
                          <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0ms]" />
                          <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:150ms]" />
                          <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:300ms]" />
                        </span>
                      ) : (
                        <MarkdownMessage content={msg.content} isUser={msg.role === "user"} />
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Quick chips */}
          <div className="px-4 py-2.5 border-t border-gray-100 bg-white/80 flex gap-2 overflow-x-auto">
            {chips.slice(0, 4).map((chip) => (
              <button
                key={chip}
                onClick={() => sendMessage(chip)}
                disabled={streaming || contextLoading}
                className="flex-shrink-0 bg-gray-50 hover:bg-[#1a5c4a]/5 border border-gray-200 hover:border-[#1a5c4a]/30 text-gray-500 hover:text-[#1a5c4a] text-xs px-3 py-1.5 rounded-full transition-colors disabled:opacity-40 whitespace-nowrap"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-4 py-3 bg-white border-t border-gray-100">
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={userContext ? `Ask Aria anything, ${userContext.firstName}...` : "Ask Aria anything in English or Arabic..."}
                disabled={streaming || contextLoading}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5c4a]/30 focus:border-[#1a5c4a] disabled:opacity-50 bg-gray-50/50"
              />
              <button
                type="submit"
                disabled={!input.trim() || streaming || contextLoading}
                className="bg-[#1a5c4a] hover:bg-[#0d3d30] disabled:opacity-40 text-white px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 text-sm font-medium"
              >
                {streaming ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
                Send
              </button>
            </form>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 text-sm text-gray-400 justify-center">
          <span>Prefer real-time chat?</span>
          <a href="https://wa.me/201011348217" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[#25D366] font-semibold hover:underline">
            <WhatsAppIcon className="w-4 h-4" />
            Message us on WhatsApp
          </a>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-4"><hr className="border-gray-200" /></div>

      {/* Book a Meeting */}
      <section id="calendar-section" className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#1F2A2A]">Book a Strategy Session</h2>
          <p className="text-gray-500 text-sm mt-2">
            Schedule a 30-minute call with our GTM team — pick a time that works for you
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#0d3d30] to-[#1a5c4a] px-5 py-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Schedule with Enigma Sales</p>
              <p className="text-white/60 text-xs">GTM Strategy Session · 30 minutes</p>
            </div>
          </div>
          <div className="relative">
            <iframe
              src="https://calendar.app.google/1wH7dVqJZ9y91ito6"
              width="100%"
              height="640"
              frameBorder="0"
              scrolling="yes"
              className="block"
              title="Book a meeting with Enigma Sales"
              allow="camera; microphone; fullscreen"
            />
          </div>
          <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-400">Calendar not loading?</p>
            <a href="https://calendar.app.google/1wH7dVqJZ9y91ito6" target="_blank" rel="noopener noreferrer"
              className="text-xs text-[#1a5c4a] font-semibold hover:underline flex items-center gap-1">
              Open in Google Calendar
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Contact strip */}
      <section className="bg-[#0d3d30] text-white py-12 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="flex justify-center mb-3"><WhatsAppIcon className="w-7 h-7 text-[#25D366]" /></div>
            <p className="text-white/60 text-xs uppercase tracking-wider mb-1">WhatsApp</p>
            <a href="https://wa.me/201011348217" target="_blank" rel="noopener noreferrer"
              className="text-white font-semibold hover:text-[#25D366] transition-colors">+20 101 134 8217</a>
          </div>
          <div>
            <div className="flex justify-center mb-3">
              <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Email</p>
            <a href="mailto:growth@enigmasales.io" className="text-white font-semibold hover:text-blue-400 transition-colors">
              growth@enigmasales.io
            </a>
          </div>
          <div>
            <div className="flex justify-center mb-3">
              <svg className="w-7 h-7 text-[#FF6B63]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Phone</p>
            <a href="tel:+201011348217" className="text-white font-semibold hover:text-[#FF6B63] transition-colors">
              +20 101 134 8217
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400 bg-white">
        <p>© 2024 AVORA by Enigma Sales. All rights reserved.</p>
        <div className="mt-2 flex gap-4 justify-center text-xs">
          <Link href="/" className="hover:text-[#1a5c4a]">Home</Link>
          <Link href="/register" className="hover:text-[#1a5c4a]">Sign Up</Link>
          <Link href="/login" className="hover:text-[#1a5c4a]">Sign In</Link>
        </div>
      </footer>
    </div>
  );
}
