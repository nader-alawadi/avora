"use client";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Map } from "lucide-react";

interface DmuRole {
  role: string;
  typicalTitles: string[];
  concerns: string[];
  messagingAngle: string;
  decisionWeight: string;
}

interface DmuData {
  title?: string;
  roles?: DmuRole[];
  buyingProcess?: string;
  keyObjections?: string[];
  summary?: string;
}

const ROLE_COLORS: Record<string, { bg: string; text: string; border: string; ring: string }> = {
  "Economic Buyer": { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200", ring: "#7c3aed" },
  "Champion":       { bg: "bg-green-100",  text: "text-green-700",  border: "border-green-200",  ring: "#16a34a" },
  "Technical Buyer": { bg: "bg-blue-100",  text: "text-blue-700",   border: "border-blue-200",   ring: "#2563eb" },
  "End User":       { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200", ring: "#d97706" },
  "Influencer":     { bg: "bg-pink-100",   text: "text-pink-700",   border: "border-pink-200",   ring: "#db2777" },
};

function parseWeight(weight: string): number {
  const match = weight.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 50;
}

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function DmuTab({ data }: { data: Record<string, unknown> | null }) {
  if (!data) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
        <div className="w-16 h-16 bg-[#1A6B6B]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Map className="text-[#1A6B6B]" size={28} />
        </div>
        <h3 className="font-bold text-[#1F2A2A] text-lg mb-2">No DMU data yet</h3>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">Generate your strategy first to see your Decision Making Unit map.</p>
      </motion.div>
    );
  }

  const dmu = data as DmuData;

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
      {dmu.summary && (
        <motion.div variants={fadeUp}>
          <Card className="bg-gradient-to-br from-[#1A6B6B]/5 to-[#2D8080]/5 border-[#1A6B6B]/15">
            <h3 className="font-bold text-[#1A6B6B] mb-2 flex items-center gap-2"><Map size={18} /> DMU Overview</h3>
            <p className="text-gray-700 text-sm leading-relaxed">{dmu.summary}</p>
          </Card>
        </motion.div>
      )}

      {dmu.roles && dmu.roles.length > 0 && (
        <motion.div variants={fadeUp}>
          <h3 className="font-bold text-[#1F2A2A] mb-4">Decision Making Unit Roles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dmu.roles.map((role, i) => {
              const colors = ROLE_COLORS[role.role] || { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200", ring: "#6b7280" };
              const weight = parseWeight(role.decisionWeight);
              return (
                <motion.div key={i} variants={fadeUp}>
                  <Card hover>
                    <div className="flex items-start justify-between mb-3">
                      <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${colors.bg} ${colors.text} ${colors.border}`}>
                        {role.role}
                      </div>
                      <ProgressRing value={weight} size={48} strokeWidth={4} color={colors.ring} />
                    </div>

                    {role.typicalTitles && role.typicalTitles.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1.5">Typical Titles</p>
                        <div className="flex flex-wrap gap-1">
                          {role.typicalTitles.map((t, j) => (
                            <span key={j} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-lg">{t}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {role.concerns && role.concerns.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1.5">Key Concerns</p>
                        <ul className="space-y-1">
                          {role.concerns.map((c, j) => (
                            <li key={j} className="text-xs text-gray-600 flex gap-1.5"><span className="text-red-400">•</span> {c}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {role.messagingAngle && (
                      <div className="bg-[#1A6B6B]/5 rounded-xl p-3 mt-2">
                        <p className="text-xs font-semibold text-[#1A6B6B] mb-1">Messaging Angle</p>
                        <p className="text-xs text-gray-700 leading-relaxed">{role.messagingAngle}</p>
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dmu.buyingProcess && (
          <Card hover>
            <h3 className="font-bold text-[#1F2A2A] mb-3">🔄 Buying Process</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{dmu.buyingProcess}</p>
          </Card>
        )}
        {dmu.keyObjections && dmu.keyObjections.length > 0 && (
          <Card hover>
            <h3 className="font-bold text-[#1F2A2A] mb-3">💬 Key Objections & Responses</h3>
            <ul className="space-y-2">
              {dmu.keyObjections.map((obj, i) => (
                <li key={i} className="text-sm text-gray-700 flex gap-2"><span className="text-amber-500 flex-shrink-0">⚠</span>{obj}</li>
              ))}
            </ul>
          </Card>
        )}
      </motion.div>
    </motion.div>
  );
}
