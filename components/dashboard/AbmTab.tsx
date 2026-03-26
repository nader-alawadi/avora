"use client";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Trophy } from "lucide-react";

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
  { gradient: "from-purple-500 to-purple-600", border: "border-purple-200", badge: "bg-purple-100 text-purple-700", icon: "🥇", light: "bg-purple-50" },
  { gradient: "from-blue-500 to-blue-600", border: "border-blue-200", badge: "bg-blue-100 text-blue-700", icon: "🥈", light: "bg-blue-50" },
  { gradient: "from-gray-400 to-gray-500", border: "border-gray-200", badge: "bg-gray-100 text-gray-700", icon: "🥉", light: "bg-gray-50" },
];

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function AbmTab({ data }: { data: Record<string, unknown> | null }) {
  if (!data) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
        <div className="w-16 h-16 bg-[#1A6B6B]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Trophy className="text-[#1A6B6B]" size={28} />
        </div>
        <h3 className="font-bold text-[#1F2A2A] text-lg mb-2">No ABM data yet</h3>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">Generate your strategy first to see your ABM tiers.</p>
      </motion.div>
    );
  }

  const abm = data as AbmData;

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
      {abm.summary && (
        <motion.div variants={fadeUp}>
          <Card className="bg-gradient-to-br from-[#1A6B6B]/5 to-[#2D8080]/5 border-[#1A6B6B]/15">
            <h3 className="font-bold text-[#1A6B6B] mb-2 flex items-center gap-2"><Trophy size={18} /> ABM Strategy Overview</h3>
            <p className="text-gray-700 text-sm leading-relaxed">{abm.summary}</p>
          </Card>
        </motion.div>
      )}

      {abm.tiers && abm.tiers.length > 0 && (
        <motion.div variants={fadeUp}>
          <h3 className="font-bold text-[#1F2A2A] mb-4">Account Tiers</h3>
          <div className="space-y-4">
            {abm.tiers.map((tier, i) => {
              const style = TIER_STYLES[i] || TIER_STYLES[2];
              return (
                <motion.div key={i} variants={fadeUp}
                  className={`rounded-2xl border-2 ${style.border} overflow-hidden card-hover`}>
                  <div className={`bg-gradient-to-r ${style.gradient} px-6 py-3 flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{style.icon}</span>
                      <span className="text-white font-bold text-sm">{tier.tier}</span>
                    </div>
                    {tier.accountCount && (
                      <span className="text-white/80 text-xs font-medium bg-white/20 px-3 py-1 rounded-full">
                        ~{tier.accountCount} accounts
                      </span>
                    )}
                  </div>
                  <div className="p-6">
                    {tier.criteria && tier.criteria.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Criteria</p>
                        <div className="flex flex-wrap gap-2">
                          {tier.criteria.map((c, j) => (
                            <span key={j} className="bg-white border border-gray-200 text-gray-700 text-xs px-2.5 py-1 rounded-lg shadow-sm">{c}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {tier.approach && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Approach</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{tier.approach}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {abm.prioritizationFramework && (
          <Card hover>
            <h3 className="font-bold text-[#1F2A2A] mb-3">🎯 Prioritization Framework</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{abm.prioritizationFramework}</p>
          </Card>
        )}
        {abm.kpis && abm.kpis.length > 0 && (
          <Card hover>
            <h3 className="font-bold text-[#1F2A2A] mb-3">📈 KPIs to Track</h3>
            <ul className="space-y-2">
              {abm.kpis.map((kpi, i) => (
                <li key={i} className="text-sm text-gray-700 flex gap-2"><span className="text-[#1A6B6B]">→</span>{kpi}</li>
              ))}
            </ul>
          </Card>
        )}
      </motion.div>
    </motion.div>
  );
}
