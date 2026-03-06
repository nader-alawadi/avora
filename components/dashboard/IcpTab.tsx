"use client";
import { Card } from "@/components/ui/Card";

interface IcpData {
  title?: string;
  firmographics?: {
    industries?: string[];
    companySize?: string;
    revenue?: string;
    geography?: string[];
    techStack?: string[];
  };
  psychographics?: {
    challenges?: string[];
    motivations?: string[];
    priorities?: string[];
  };
  triggers?: string[];
  qualifiers?: string[];
  disqualifiers?: string[];
  summary?: string;
  warnings?: string[];
}

export function IcpTab({ data }: { data: Record<string, unknown> | null }) {
  if (!data) {
    return (
      <div className="text-center py-12 text-gray-400">
        No ICP data yet. Generate your strategy first.
      </div>
    );
  }

  const icp = data as IcpData;

  return (
    <div className="space-y-6">
      {icp.warnings && icp.warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="font-semibold text-amber-800 text-sm mb-2">⚠️ Data Warnings</p>
          <ul className="list-disc list-inside space-y-1">
            {icp.warnings.map((w, i) => (
              <li key={i} className="text-amber-700 text-xs">{w}</li>
            ))}
          </ul>
        </div>
      )}

      {icp.summary && (
        <Card className="bg-[#1E6663]/5 border-[#1E6663]/20">
          <h3 className="font-bold text-[#1E6663] mb-2">ICP Summary</h3>
          <p className="text-gray-700 text-sm leading-relaxed">{icp.summary}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {icp.firmographics && (
          <Card>
            <h3 className="font-bold text-[#1F2A2A] mb-4">📊 Firmographics</h3>
            <div className="space-y-3">
              {icp.firmographics.industries && icp.firmographics.industries.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Industries</p>
                  <div className="flex flex-wrap gap-1.5">
                    {icp.firmographics.industries.map((ind, i) => (
                      <span key={i} className="bg-[#1E6663]/10 text-[#1E6663] text-xs px-2 py-1 rounded-full">
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {icp.firmographics.companySize && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Company Size</p>
                  <p className="text-sm text-[#1F2A2A]">{icp.firmographics.companySize}</p>
                </div>
              )}
              {icp.firmographics.revenue && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Revenue Range</p>
                  <p className="text-sm text-[#1F2A2A]">{icp.firmographics.revenue}</p>
                </div>
              )}
              {icp.firmographics.geography && icp.firmographics.geography.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Geography</p>
                  <div className="flex flex-wrap gap-1.5">
                    {icp.firmographics.geography.map((g, i) => (
                      <span key={i} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                        🌍 {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {icp.firmographics.techStack && icp.firmographics.techStack.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Tech Stack</p>
                  <div className="flex flex-wrap gap-1.5">
                    {icp.firmographics.techStack.map((t, i) => (
                      <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {icp.psychographics && (
          <Card>
            <h3 className="font-bold text-[#1F2A2A] mb-4">🧠 Psychographics</h3>
            <div className="space-y-3">
              {icp.psychographics.challenges && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Key Challenges</p>
                  <ul className="space-y-1">
                    {icp.psychographics.challenges.map((c, i) => (
                      <li key={i} className="text-sm text-gray-700 flex gap-2">
                        <span className="text-red-400 mt-0.5 flex-shrink-0">●</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {icp.psychographics.motivations && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Motivations</p>
                  <ul className="space-y-1">
                    {icp.psychographics.motivations.map((m, i) => (
                      <li key={i} className="text-sm text-gray-700 flex gap-2">
                        <span className="text-green-400 mt-0.5 flex-shrink-0">●</span>
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {icp.triggers && icp.triggers.length > 0 && (
          <Card>
            <h3 className="font-bold text-[#1F2A2A] mb-3">⚡ Buying Triggers</h3>
            <ul className="space-y-2">
              {icp.triggers.map((t, i) => (
                <li key={i} className="text-sm text-gray-700 flex gap-2 items-start">
                  <span className="text-yellow-500 mt-0.5">⚡</span>
                  {t}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {icp.qualifiers && icp.qualifiers.length > 0 && (
          <Card>
            <h3 className="font-bold text-[#1F2A2A] mb-3">✅ Qualifiers</h3>
            <ul className="space-y-2">
              {icp.qualifiers.map((q, i) => (
                <li key={i} className="text-sm text-gray-700 flex gap-2 items-start">
                  <span className="text-green-500 mt-0.5">✓</span>
                  {q}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {icp.disqualifiers && icp.disqualifiers.length > 0 && (
          <Card>
            <h3 className="font-bold text-[#1F2A2A] mb-3">🚫 Disqualifiers</h3>
            <ul className="space-y-2">
              {icp.disqualifiers.map((d, i) => (
                <li key={i} className="text-sm text-gray-700 flex gap-2 items-start">
                  <span className="text-red-500 mt-0.5">✗</span>
                  {d}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
