"use client";
import { Card } from "@/components/ui/Card";

interface AbmTier {
  tier: string;
  criteria: string[];
  accountCount: string;
  approach: string;
}

interface AbmData {
  title?: string;
  tiers?: AbmTier[];
  prioritizationFramework?: string;
  kpis?: string[];
  summary?: string;
}

const TIER_STYLES = [
  { bg: "bg-purple-50", border: "border-purple-200", badge: "bg-purple-100 text-purple-700", icon: "🥇" },
  { bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-100 text-blue-700", icon: "🥈" },
  { bg: "bg-gray-50", border: "border-gray-200", badge: "bg-gray-100 text-gray-700", icon: "🥉" },
];

export function AbmTab({ data }: { data: Record<string, unknown> | null }) {
  if (!data) {
    return (
      <div className="text-center py-12 text-gray-400">
        No ABM data yet. Generate your strategy first.
      </div>
    );
  }

  const abm = data as AbmData;

  return (
    <div className="space-y-6">
      {abm.summary && (
        <Card className="bg-[#1E6663]/5 border-[#1E6663]/20">
          <h3 className="font-bold text-[#1E6663] mb-2">ABM Strategy Overview</h3>
          <p className="text-gray-700 text-sm leading-relaxed">{abm.summary}</p>
        </Card>
      )}

      {abm.tiers && abm.tiers.length > 0 && (
        <div>
          <h3 className="font-bold text-[#1F2A2A] mb-4">Account Tiers</h3>
          <div className="space-y-4">
            {abm.tiers.map((tier, i) => {
              const style = TIER_STYLES[i] || TIER_STYLES[2];
              return (
                <div key={i} className={`rounded-xl border-2 ${style.border} p-6`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{style.icon}</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${style.badge}`}>
                        {tier.tier}
                      </span>
                    </div>
                    {tier.accountCount && (
                      <span className="text-sm text-gray-500">
                        ~{tier.accountCount} accounts
                      </span>
                    )}
                  </div>

                  {tier.criteria && tier.criteria.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Criteria</p>
                      <div className="flex flex-wrap gap-2">
                        {tier.criteria.map((c, j) => (
                          <span key={j} className="bg-white border border-gray-200 text-gray-700 text-xs px-2 py-1 rounded-lg">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {tier.approach && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Approach</p>
                      <p className="text-sm text-gray-700">{tier.approach}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {abm.prioritizationFramework && (
          <Card>
            <h3 className="font-bold text-[#1F2A2A] mb-3">🎯 Prioritization Framework</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{abm.prioritizationFramework}</p>
          </Card>
        )}

        {abm.kpis && abm.kpis.length > 0 && (
          <Card>
            <h3 className="font-bold text-[#1F2A2A] mb-3">📈 KPIs to Track</h3>
            <ul className="space-y-2">
              {abm.kpis.map((kpi, i) => (
                <li key={i} className="text-sm text-gray-700 flex gap-2">
                  <span className="text-[#1E6663]">→</span>
                  {kpi}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
