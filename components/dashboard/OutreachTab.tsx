"use client";
import { useState } from "react";
import { Card } from "@/components/ui/Card";

interface MessagingFramework {
  hook: string;
  value: string;
  cta: string;
}

interface OutreachChannel {
  channel: string;
  strategy: string;
  cadence: string;
  messagingFramework: MessagingFramework;
  templates: string[];
}

interface OutreachData {
  channels?: OutreachChannel[];
  sequenceOverview?: string;
  summary?: string;
}

const CHANNEL_ICONS: Record<string, string> = {
  LinkedIn: "💼",
  Email: "📧",
  WhatsApp: "💬",
};

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
      {outreach.summary && (
        <Card className="bg-[#1E6663]/5 border-[#1E6663]/20">
          <h3 className="font-bold text-[#1E6663] mb-2">Outreach Strategy Overview</h3>
          <p className="text-gray-700 text-sm leading-relaxed">{outreach.summary}</p>
        </Card>
      )}

      {outreach.sequenceOverview && (
        <Card>
          <h3 className="font-bold text-[#1F2A2A] mb-2">📅 Sequence Overview</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{outreach.sequenceOverview}</p>
        </Card>
      )}

      {outreach.channels && outreach.channels.length > 0 && (
        <div className="space-y-3">
          {outreach.channels.map((channel, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedChannel(expandedChannel === i ? null : i)}
                className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {CHANNEL_ICONS[channel.channel] || "📤"}
                  </span>
                  <span className="font-bold text-[#1F2A2A]">{channel.channel}</span>
                  {channel.cadence && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {channel.cadence}
                    </span>
                  )}
                </div>
                <span className="text-gray-400">
                  {expandedChannel === i ? "▲" : "▼"}
                </span>
              </button>

              {expandedChannel === i && (
                <div className="px-5 pb-5 space-y-4">
                  {channel.strategy && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Strategy</p>
                      <p className="text-sm text-gray-700">{channel.strategy}</p>
                    </div>
                  )}

                  {channel.messagingFramework && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="bg-yellow-50 rounded-lg p-3">
                        <p className="text-xs font-bold text-yellow-700 mb-1">🪝 Hook</p>
                        <p className="text-xs text-gray-700">{channel.messagingFramework.hook}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-xs font-bold text-green-700 mb-1">💎 Value</p>
                        <p className="text-xs text-gray-700">{channel.messagingFramework.value}</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs font-bold text-blue-700 mb-1">📣 CTA</p>
                        <p className="text-xs text-gray-700">{channel.messagingFramework.cta}</p>
                      </div>
                    </div>
                  )}

                  {channel.templates && channel.templates.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                        Message Templates
                      </p>
                      <div className="space-y-3">
                        {channel.templates.map((template, j) => (
                          <div
                            key={j}
                            className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-sm text-gray-700 font-mono whitespace-pre-wrap"
                          >
                            {template}
                          </div>
                        ))}
                      </div>
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
