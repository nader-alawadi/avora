"use client";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Target, AlertTriangle } from "lucide-react";

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

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function IcpTab({ data }: { data: Record<string, unknown> | null }) {
  if (!data) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="text-center py-16">
        <div className="w-16 h-16 bg-[#1A6B6B]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Target className="text-[#1A6B6B]" size={28} />
        </div>
        <h3 className="font-bold text-[#1F2A2A] text-lg mb-2">No ICP data yet</h3>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">
          Generate your strategy first to see your Ideal Customer Profile.
        </p>
      </motion.div>
    );
  }

  const icp = data as IcpData;

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
      {icp.warnings && icp.warnings.length > 0 && (
        <motion.div variants={fadeUp} className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="text-amber-500 mt-0.5 flex-shrink-0" size={18} />
          <div>
            <p className="font-semibold text-amber-800 text-sm mb-1">Data Warnings</p>
            <ul className="list-disc list-inside space-y-1">
              {icp.warnings.map((w, i) => (
                <li key={i} className="text-amber-700 text-xs">{w}</li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}

      {icp.summary && (
        <motion.div variants={fadeUp}>
          <Card className="bg-gradient-to-br from-[#1A6B6B]/5 to-[#2D8080]/5 border-[#1A6B6B]/15">
            <h3 className="font-bold text-[#1A6B6B] mb-2 flex items-center gap-2">
              <Target size={18} /> ICP Summary
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">{icp.summary}</p>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {icp.firmographics && (
          <motion.div variants={fadeUp}>
            <Card hover>
              <h3 className="font-bold text-[#1F2A2A] mb-4">📊 Firmographics</h3>
              <div className="space-y-3">
                {icp.firmographics.industries && icp.firmographics.industries.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1.5">Industries</p>
                    <div className="flex flex-wrap gap-1.5">
                      {icp.firmographics.industries.map((ind, i) => (
                        <span key={i} className="bg-[#1A6B6B]/10 text-[#1A6B6B] text-xs px-2.5 py-1 rounded-full font-medium">{ind}</span>
                      ))}
                    </div>
                  </div>
                )}
                {icp.firmographics.companySize && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Company Size</p>
                    <p className="text-sm text-[#1F2A2A] font-medium">{icp.firmographics.companySize}</p>
                  </div>
                )}
                {icp.firmographics.revenue && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Revenue Range</p>
                    <p className="text-sm text-[#1F2A2A] font-medium">{icp.firmographics.revenue}</p>
                  </div>
                )}
                {icp.firmographics.geography && icp.firmographics.geography.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1.5">Geography</p>
                    <div className="flex flex-wrap gap-1.5">
                      {icp.firmographics.geography.map((g, i) => (
                        <span key={i} className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full">🌍 {g}</span>
                      ))}
                    </div>
                  </div>
                )}
                {icp.firmographics.techStack && icp.firmographics.techStack.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1.5">Tech Stack</p>
                    <div className="flex flex-wrap gap-1.5">
                      {icp.firmographics.techStack.map((t, i) => (
                        <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {icp.psychographics && (
          <motion.div variants={fadeUp}>
            <Card hover>
              <h3 className="font-bold text-[#1F2A2A] mb-4">🧠 Psychographics</h3>
              <div className="space-y-3">
                {icp.psychographics.challenges && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1.5">Key Challenges</p>
                    <ul className="space-y-1.5">
                      {icp.psychographics.challenges.map((c, i) => (
                        <li key={i} className="text-sm text-gray-700 flex gap-2">
                          <span className="text-red-400 mt-0.5 flex-shrink-0">●</span>{c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {icp.psychographics.motivations && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1.5">Motivations</p>
                    <ul className="space-y-1.5">
                      {icp.psychographics.motivations.map((m, i) => (
                        <li key={i} className="text-sm text-gray-700 flex gap-2">
                          <span className="text-green-400 mt-0.5 flex-shrink-0">●</span>{m}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {icp.triggers && icp.triggers.length > 0 && (
          <Card hover>
            <h3 className="font-bold text-[#1F2A2A] mb-3">⚡ Buying Triggers</h3>
            <ul className="space-y-2">
              {icp.triggers.map((t, i) => (
                <li key={i} className="text-sm text-gray-700 flex gap-2 items-start">
                  <span className="text-yellow-500 mt-0.5">⚡</span>{t}
                </li>
              ))}
            </ul>
          </Card>
        )}
        {icp.qualifiers && icp.qualifiers.length > 0 && (
          <Card hover>
            <h3 className="font-bold text-[#1F2A2A] mb-3">✅ Qualifiers</h3>
            <ul className="space-y-2">
              {icp.qualifiers.map((q, i) => (
                <li key={i} className="text-sm text-gray-700 flex gap-2 items-start">
                  <span className="text-green-500 mt-0.5">✓</span>{q}
                </li>
              ))}
            </ul>
          </Card>
        )}
        {icp.disqualifiers && icp.disqualifiers.length > 0 && (
          <Card hover>
            <h3 className="font-bold text-[#1F2A2A] mb-3">🚫 Disqualifiers</h3>
            <ul className="space-y-2">
              {icp.disqualifiers.map((d, i) => (
                <li key={i} className="text-sm text-gray-700 flex gap-2 items-start">
                  <span className="text-red-500 mt-0.5">✗</span>{d}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </motion.div>
    </motion.div>
  );
}
