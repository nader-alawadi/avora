"use client";
import { Card } from "@/components/ui/Card";

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

const ROLE_COLORS: Record<string, string> = {
  "Economic Buyer": "bg-purple-100 text-purple-700 border-purple-200",
  "Champion": "bg-green-100 text-green-700 border-green-200",
  "Technical Buyer": "bg-blue-100 text-blue-700 border-blue-200",
  "End User": "bg-orange-100 text-orange-700 border-orange-200",
  "Influencer": "bg-pink-100 text-pink-700 border-pink-200",
};

export function DmuTab({ data }: { data: Record<string, unknown> | null }) {
  if (!data) {
    return (
      <div className="text-center py-12 text-gray-400">
        No DMU data yet. Generate your strategy first.
      </div>
    );
  }

  const dmu = data as DmuData;

  return (
    <div className="space-y-6">
      {dmu.summary && (
        <Card className="bg-[#1E6663]/5 border-[#1E6663]/20">
          <h3 className="font-bold text-[#1E6663] mb-2">DMU Overview</h3>
          <p className="text-gray-700 text-sm leading-relaxed">{dmu.summary}</p>
        </Card>
      )}

      {dmu.roles && dmu.roles.length > 0 && (
        <div>
          <h3 className="font-bold text-[#1F2A2A] mb-4">Decision Making Unit Roles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dmu.roles.map((role, i) => (
              <Card key={i}>
                <div
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border mb-3 ${
                    ROLE_COLORS[role.role] || "bg-gray-100 text-gray-700 border-gray-200"
                  }`}
                >
                  {role.role}
                </div>

                {role.decisionWeight && (
                  <p className="text-xs text-gray-500 mb-3">
                    Decision weight: <span className="font-semibold">{role.decisionWeight}</span>
                  </p>
                )}

                {role.typicalTitles && role.typicalTitles.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Typical Titles</p>
                    <div className="flex flex-wrap gap-1">
                      {role.typicalTitles.map((t, j) => (
                        <span key={j} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {role.concerns && role.concerns.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Key Concerns</p>
                    <ul className="space-y-1">
                      {role.concerns.map((c, j) => (
                        <li key={j} className="text-xs text-gray-600 flex gap-1.5">
                          <span className="text-red-400">•</span> {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {role.messagingAngle && (
                  <div className="bg-[#1E6663]/5 rounded-lg p-3 mt-2">
                    <p className="text-xs font-semibold text-[#1E6663] mb-1">Messaging Angle</p>
                    <p className="text-xs text-gray-700">{role.messagingAngle}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dmu.buyingProcess && (
          <Card>
            <h3 className="font-bold text-[#1F2A2A] mb-3">🔄 Buying Process</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{dmu.buyingProcess}</p>
          </Card>
        )}

        {dmu.keyObjections && dmu.keyObjections.length > 0 && (
          <Card>
            <h3 className="font-bold text-[#1F2A2A] mb-3">💬 Key Objections & Responses</h3>
            <ul className="space-y-2">
              {dmu.keyObjections.map((obj, i) => (
                <li key={i} className="text-sm text-gray-700 flex gap-2">
                  <span className="text-amber-500 flex-shrink-0">⚠</span>
                  {obj}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
