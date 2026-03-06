"use client";
import { useState } from "react";
import { Card } from "@/components/ui/Card";

// ── Types matching ai-engine.ts output ───────────────────────────────────────

interface EmailStep {
  day: number;
  subject: string;
  body: string;
}

interface LinkedInStep {
  day: number;
  type: string;
  message: string;
}

interface WhatsAppStep {
  day: number;
  message: string;
}

interface ObjectionLoop {
  objection: string;
  reframe: string;
}

interface ColdCallScript {
  opening: string;
  qualify: string[];
  pitch: {
    logical: string;
    emotional: string;
    credibility: string;
  };
  objectionLoops: ObjectionLoop[];
  close: string;
}

interface OutreachChannel {
  channel: string;
  strategy: string;
  cadence?: string;
  // Email & LinkedIn & WhatsApp
  sequence?: (EmailStep | LinkedInStep | WhatsAppStep)[];
  // ColdCall
  script?: ColdCallScript;
}

interface OutreachData {
  title?: string;
  dialect?: string;
  tone?: string;
  channels?: OutreachChannel[];
  sequenceOverview?: string;
  summary?: string;
  englishSummary?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const CHANNEL_ICONS: Record<string, string> = {
  LinkedIn: "💼",
  Email: "📧",
  WhatsApp: "💬",
  ColdCall: "📞",
};

function isEmailStep(step: unknown, channel: string): step is EmailStep {
  return channel === "Email" && typeof (step as EmailStep).subject === "string";
}

function isLinkedInStep(step: unknown, channel: string): step is LinkedInStep {
  return channel === "LinkedIn" && typeof (step as LinkedInStep).type === "string";
}

// ── Sub-components ────────────────────────────────────────────────────────────

function EmailSequence({ sequence }: { sequence: EmailStep[] }) {
  return (
    <div className="space-y-4">
      {sequence.map((step, i) => (
        <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-[#1E6663] text-white text-xs font-bold px-2.5 py-1 rounded-full">
              Day {step.day}
            </span>
            <span className="text-xs font-semibold text-gray-500 uppercase">Email</span>
          </div>
          <div className="mb-2">
            <p className="text-xs font-semibold text-gray-500 mb-1">Subject</p>
            <p className="text-sm font-medium text-gray-800 bg-white border border-gray-200 rounded-lg px-3 py-2">
              {step.subject}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Body</p>
            <p className="text-sm text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 whitespace-pre-wrap leading-relaxed font-mono">
              {step.body}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function LinkedInSequence({ sequence }: { sequence: LinkedInStep[] }) {
  return (
    <div className="space-y-3">
      {sequence.map((step, i) => (
        <div key={i} className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              Day {step.day}
            </span>
            <span className="text-xs font-semibold text-blue-700">{step.type}</span>
          </div>
          <p className="text-sm text-gray-700 bg-white border border-blue-200 rounded-lg px-3 py-2 whitespace-pre-wrap font-mono leading-relaxed">
            {step.message}
          </p>
        </div>
      ))}
    </div>
  );
}

function WhatsAppSequence({ sequence }: { sequence: WhatsAppStep[] }) {
  return (
    <div className="space-y-3">
      {sequence.map((step, i) => (
        <div key={i} className="bg-green-50 border border-green-200 rounded-xl p-4">
          <span className="bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded-full mb-2 inline-block">
            Day {step.day}
          </span>
          <p className="text-sm text-gray-700 bg-white border border-green-200 rounded-lg px-3 py-2 whitespace-pre-wrap font-mono leading-relaxed mt-2">
            {step.message}
          </p>
        </div>
      ))}
    </div>
  );
}

function ColdCallScriptView({ script }: { script: ColdCallScript }) {
  const stages = [
    {
      label: "1. Pattern-Interrupt Opening",
      icon: "🎯",
      color: "bg-red-50 border-red-200",
      labelColor: "text-red-700",
      content: <p className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">{script.opening}</p>,
    },
    {
      label: "2. Qualify — Intelligence-Gathering Questions",
      icon: "🔎",
      color: "bg-yellow-50 border-yellow-200",
      labelColor: "text-yellow-700",
      content: (
        <ol className="space-y-2 list-decimal list-inside">
          {(script.qualify || []).map((q, i) => (
            <li key={i} className="text-sm text-gray-700 font-mono leading-relaxed">{q}</li>
          ))}
        </ol>
      ),
    },
    {
      label: "3. Pitch — Certainty Stack",
      icon: "📈",
      color: "bg-purple-50 border-purple-200",
      labelColor: "text-purple-700",
      content: script.pitch ? (
        <div className="space-y-3">
          <div>
            <p className="text-xs font-bold text-purple-600 mb-1">Logical Certainty</p>
            <p className="text-sm text-gray-700 font-mono whitespace-pre-wrap leading-relaxed bg-white border border-purple-200 rounded-lg px-3 py-2">{script.pitch.logical}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-purple-600 mb-1">Emotional Certainty</p>
            <p className="text-sm text-gray-700 font-mono whitespace-pre-wrap leading-relaxed bg-white border border-purple-200 rounded-lg px-3 py-2">{script.pitch.emotional}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-purple-600 mb-1">Credibility Certainty</p>
            <p className="text-sm text-gray-700 font-mono whitespace-pre-wrap leading-relaxed bg-white border border-purple-200 rounded-lg px-3 py-2">{script.pitch.credibility}</p>
          </div>
        </div>
      ) : null,
    },
    {
      label: "4. Objection Loops — Straight Line Reframes",
      icon: "🔄",
      color: "bg-orange-50 border-orange-200",
      labelColor: "text-orange-700",
      content: (
        <div className="space-y-3">
          {(script.objectionLoops || []).map((loop, i) => (
            <div key={i} className="bg-white border border-orange-200 rounded-lg p-3">
              <p className="text-xs font-bold text-orange-600 mb-1">Objection {i + 1}:</p>
              <p className="text-sm text-gray-600 font-mono italic mb-2">"{loop.objection}"</p>
              <p className="text-xs font-bold text-green-600 mb-1">Reframe:</p>
              <p className="text-sm text-gray-700 font-mono leading-relaxed">{loop.reframe}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      label: "5. Assumptive Close",
      icon: "🤝",
      color: "bg-[#1E6663]/10 border-[#1E6663]/30",
      labelColor: "text-[#1E6663]",
      content: <p className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">{script.close}</p>,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-gray-900 text-green-400 rounded-xl px-4 py-3 text-xs font-mono">
        Jordan Belfort&apos;s Straight Line Sales System — Full Script
      </div>
      {stages.map((stage, i) => (
        <div key={i} className={`border rounded-xl p-4 ${stage.color}`}>
          <p className={`text-xs font-bold mb-3 ${stage.labelColor}`}>
            {stage.icon} {stage.label}
          </p>
          {stage.content}
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function OutreachTab({ data }: { data: Record<string, unknown> | null }) {
  const [expandedChannel, setExpandedChannel] = useState<number | null>(0);

  if (!data) {
    return (
      <div className="text-center py-12 text-gray-400">
        No outreach data yet. Generate your strategy first.
      </div>
    );
  }

  const outreach = data as OutreachData;

  return (
    <div className="space-y-6">
      {/* Header info */}
      {(outreach.dialect || outreach.tone) && (
        <div className="flex gap-2 flex-wrap">
          {outreach.dialect && (
            <span className="bg-[#1E6663]/10 text-[#1E6663] text-xs font-semibold px-3 py-1 rounded-full">
              🗣 {outreach.dialect}
            </span>
          )}
          {outreach.tone && (
            <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">
              Tone: {outreach.tone}
            </span>
          )}
        </div>
      )}

      {outreach.summary && (
        <Card className="bg-[#1E6663]/5 border-[#1E6663]/20">
          <h3 className="font-bold text-[#1E6663] mb-2">Outreach Strategy Overview</h3>
          <p className="text-gray-700 text-sm leading-relaxed">{outreach.summary}</p>
        </Card>
      )}

      {outreach.sequenceOverview && (
        <Card>
          <h3 className="font-bold text-[#1F2A2A] mb-2">📅 Multi-Channel Sequence Overview</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{outreach.sequenceOverview}</p>
        </Card>
      )}

      {/* Channel accordions */}
      {outreach.channels && outreach.channels.length > 0 && (
        <div className="space-y-3">
          {outreach.channels.map((channel, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={() => setExpandedChannel(expandedChannel === i ? null : i)}
                className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{CHANNEL_ICONS[channel.channel] || "📤"}</span>
                  <span className="font-bold text-[#1F2A2A]">{channel.channel}</span>
                  {channel.cadence && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full hidden sm:inline">
                      {channel.cadence}
                    </span>
                  )}
                </div>
                <span className="text-gray-400 text-sm">{expandedChannel === i ? "▲" : "▼"}</span>
              </button>

              {expandedChannel === i && (
                <div className="px-5 pb-5 space-y-5 border-t border-gray-100 pt-4">
                  {/* Strategy */}
                  {channel.strategy && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Strategy</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{channel.strategy}</p>
                    </div>
                  )}

                  {/* Cadence badge (mobile) */}
                  {channel.cadence && (
                    <div className="sm:hidden">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Cadence</p>
                      <p className="text-xs text-gray-600">{channel.cadence}</p>
                    </div>
                  )}

                  {/* Sequence messages */}
                  {channel.sequence && channel.sequence.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Message Sequence</p>
                      {channel.channel === "Email" && isEmailStep(channel.sequence[0], "Email") ? (
                        <EmailSequence sequence={channel.sequence as EmailStep[]} />
                      ) : channel.channel === "LinkedIn" && isLinkedInStep(channel.sequence[0], "LinkedIn") ? (
                        <LinkedInSequence sequence={channel.sequence as LinkedInStep[]} />
                      ) : (
                        <WhatsAppSequence sequence={channel.sequence as WhatsAppStep[]} />
                      )}
                    </div>
                  )}

                  {/* Cold Call script */}
                  {channel.script && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Cold Call Script</p>
                      <ColdCallScriptView script={channel.script} />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
