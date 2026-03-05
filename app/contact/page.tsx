"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "What does AVORA do?",
  "What's included in the free plan?",
  "How do I order leads?",
  "What is the DMU Map?",
  "How long does lead delivery take?",
];

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function ContactPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (chatOpen && messages.length === 0) {
      // Show welcome message
      setMessages([
        {
          role: "assistant",
          content:
            "Hi! I'm AVORA Assistant. I can answer questions about the platform, pricing, lead generation, and GTM strategy. How can I help you today?",
        },
      ]);
    }
    if (chatOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [chatOpen, messages.length]);

  async function sendMessage(text?: string) {
    const userText = text ?? input.trim();
    if (!userText || streaming) return;

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userText },
    ];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);

    // Append placeholder for streaming assistant response
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
        }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            accumulated += parsed.text;
            setMessages((prev) => {
              const updated = [...prev];
              updated[assistantIdx] = {
                role: "assistant",
                content: accumulated,
              };
              return updated;
            });
          } catch {
            // ignore parse errors
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[assistantIdx] = {
          role: "assistant",
          content:
            "Sorry, I'm having trouble connecting right now. Please reach out via WhatsApp or email instead.",
        };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  }

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
            <Link href="/" className="text-sm text-gray-500 hover:text-[#1a5c4a]">
              Home
            </Link>
            <Link href="/login" className="text-sm text-gray-500 hover:text-[#1a5c4a]">
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-[#FF6B63] hover:bg-[#e55d55] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0d3d30] via-[#1a5c4a] to-[#1E6663] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            We&apos;re here to help
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Let&apos;s Build Your GTM Engine
          </h1>
          <p className="mt-4 text-lg text-white/70 max-w-xl mx-auto">
            Ask our AI assistant, chat on WhatsApp, or book a strategy session.
            We&apos;re here to help you close more deals.
          </p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="max-w-5xl mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* AI Chat Card */}
          <button
            onClick={() => {
              setChatOpen(true);
              setTimeout(
                () =>
                  document
                    .getElementById("chat-section")
                    ?.scrollIntoView({ behavior: "smooth" }),
                100
              );
            }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-left hover:shadow-md hover:border-[#1a5c4a]/30 transition-all group"
          >
            <div className="w-10 h-10 bg-[#1a5c4a]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#1a5c4a]/20 transition-colors">
              <svg
                className="w-5 h-5 text-[#1a5c4a]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <h3 className="font-bold text-[#1F2A2A] text-sm">AI Assistant</h3>
            <p className="text-gray-500 text-xs mt-1">
              Get instant answers about AVORA, pricing, and GTM strategy.
            </p>
            <span className="mt-3 inline-flex items-center text-[#1a5c4a] text-xs font-semibold">
              Chat now →
            </span>
          </button>

          {/* WhatsApp Card */}
          <a
            href="https://wa.me/201011348217"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-left hover:shadow-md hover:border-green-300 transition-all group"
          >
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
              <WhatsAppIcon className="w-5 h-5 text-[#25D366]" />
            </div>
            <h3 className="font-bold text-[#1F2A2A] text-sm">WhatsApp</h3>
            <p className="text-gray-500 text-xs mt-1">
              Chat with our team directly. Fastest way to get a payment link or support.
            </p>
            <span className="mt-3 inline-flex items-center text-green-600 text-xs font-semibold">
              +20 101 134 8217 →
            </span>
          </a>

          {/* Email Card */}
          <a
            href="mailto:growth@enigmasales.io"
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-left hover:shadow-md hover:border-blue-200 transition-all group"
          >
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="font-bold text-[#1F2A2A] text-sm">Email</h3>
            <p className="text-gray-500 text-xs mt-1">
              For detailed inquiries, partnerships, or technical support.
            </p>
            <span className="mt-3 inline-flex items-center text-blue-600 text-xs font-semibold">
              growth@enigmasales.io →
            </span>
          </a>

          {/* Book a Call Card */}
          <button
            onClick={() =>
              document
                .getElementById("calendar-section")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-left hover:shadow-md hover:border-[#FF6B63]/30 transition-all group"
          >
            <div className="w-10 h-10 bg-[#FF6B63]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#FF6B63]/20 transition-colors">
              <svg
                className="w-5 h-5 text-[#FF6B63]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="font-bold text-[#1F2A2A] text-sm">Book a Call</h3>
            <p className="text-gray-500 text-xs mt-1">
              Schedule a 30-min strategy session with our GTM team.
            </p>
            <span className="mt-3 inline-flex items-center text-[#FF6B63] text-xs font-semibold">
              Pick a time →
            </span>
          </button>
        </div>
      </section>

      {/* AI Chat Section */}
      <section id="chat-section" className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#1F2A2A]">
            Ask AVORA Assistant
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            Get instant answers in English or Arabic — powered by AI
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Chat header */}
          <div className="bg-gradient-to-r from-[#0d3d30] to-[#1a5c4a] px-5 py-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">AVORA Assistant</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                <span className="text-white/60 text-xs">Online · Powered by Claude AI</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="h-[380px] overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="text-4xl mb-3">💬</div>
                <p className="text-gray-500 text-sm mb-5">
                  Ask me anything about AVORA, pricing, or GTM strategy
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setChatOpen(true);
                        sendMessage(q);
                      }}
                      className="bg-white border border-gray-200 hover:border-[#1a5c4a] hover:text-[#1a5c4a] text-gray-600 text-xs px-3 py-1.5 rounded-full transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-7 h-7 bg-[#1a5c4a] rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">A</span>
                      </div>
                    )}
                    <div
                      className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[#1a5c4a] text-white rounded-tr-sm"
                          : "bg-white border border-gray-200 text-[#1F2A2A] rounded-tl-sm shadow-sm"
                      }`}
                    >
                      {msg.content || (
                        <span className="flex gap-1 items-center text-gray-400">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Suggested questions strip (after first message) */}
          {messages.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 bg-white flex gap-2 overflow-x-auto scrollbar-hide">
              {SUGGESTED_QUESTIONS.slice(0, 3).map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  disabled={streaming}
                  className="flex-shrink-0 bg-gray-50 hover:bg-[#1a5c4a]/5 border border-gray-200 hover:border-[#1a5c4a]/30 text-gray-500 hover:text-[#1a5c4a] text-xs px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 bg-white border-t border-gray-100">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question in English or Arabic..."
                disabled={streaming}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5c4a]/30 focus:border-[#1a5c4a] disabled:opacity-60 bg-gray-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || streaming}
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

        {/* WhatsApp fallback */}
        <div className="mt-4 flex items-center gap-3 text-sm text-gray-400 justify-center">
          <span>Prefer real-time chat?</span>
          <a
            href="https://wa.me/201011348217"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[#25D366] font-semibold hover:underline"
          >
            <WhatsAppIcon className="w-4 h-4" />
            Message us on WhatsApp
          </a>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-4">
        <hr className="border-gray-200" />
      </div>

      {/* Book a Meeting */}
      <section id="calendar-section" className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#1F2A2A]">
            Book a Strategy Session
          </h2>
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

          {/* Fallback link */}
          <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Calendar not loading?
            </p>
            <a
              href="https://calendar.app.google/1wH7dVqJZ9y91ito6"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#1a5c4a] font-semibold hover:underline flex items-center gap-1"
            >
              Open in Google Calendar
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Contact details strip */}
      <section className="bg-[#0d3d30] text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="flex justify-center mb-3">
                <WhatsAppIcon className="w-7 h-7 text-[#25D366]" />
              </div>
              <p className="text-white/60 text-xs uppercase tracking-wider mb-1">WhatsApp</p>
              <a
                href="https://wa.me/201011348217"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white font-semibold hover:text-[#25D366] transition-colors"
              >
                +20 101 134 8217
              </a>
            </div>
            <div>
              <div className="flex justify-center mb-3">
                <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Email</p>
              <a
                href="mailto:growth@enigmasales.io"
                className="text-white font-semibold hover:text-blue-400 transition-colors"
              >
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
              <a
                href="tel:+201011348217"
                className="text-white font-semibold hover:text-[#FF6B63] transition-colors"
              >
                +20 101 134 8217
              </a>
            </div>
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
