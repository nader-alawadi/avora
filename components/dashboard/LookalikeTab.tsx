"use client";
import { Card } from "@/components/ui/Card";

// ── Types matching ai-engine.ts output ───────────────────────────────────────

interface LookalikeCriteria {
  category: string;
  criteria: string[];
  rationale: string;
}

interface SearchQueries {
  linkedin?: string[];
  google?: string[];
  crunchbase?: string[];
}

interface CompanyScores {
  industryFit: number;
  sizeFit: number;
  geographyFit: number;
  triggerFit: number;
  overall: number;
}

interface RecommendedCompany {
  company: string;
  website: string;
  industry: string;
  whyTheyMatch: string;
  scores: CompanyScores;
}

interface LookalikeData {
  title?: string;
  criteria?: LookalikeCriteria[];
  searchQueries?: SearchQueries;
  booleanStrings?: string[];
  recommendedCompanies?: RecommendedCompany[];
  summary?: string;
  englishSummary?: string;
  disclaimer?: string;
}

// ── Score bar ─────────────────────────────────────────────────────────────────

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color =
    value >= 80 ? "bg-green-500" :
    value >= 60 ? "bg-yellow-400" :
    "bg-red-400";

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-20 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full ${color} transition-all`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs font-bold text-gray-700 w-8 text-right">{value}</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function LookalikeTab({ data }: { data: Record<string, unknown> | null }) {
  if (!data) {
    return (
      <div className="text-center py-12 text-gray-400">
        No lookalike data yet. Generate your strategy first.
      </div>
    );
  }

  const lookalike = data as LookalikeData;

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="font-semibold text-blue-800 text-sm">
          🔍 Lookalike Account Intelligence
        </p>
        <p className="text-blue-700 text-xs mt-1">
          {lookalike.disclaimer ||
            "Company suggestions are based on AI knowledge. Verify before outreach and use the search criteria below to build your own validated lists."}
        </p>
      </div>

      {/* Summary */}
      {lookalike.summary && (
        <Card className="bg-[#1E6663]/5 border-[#1E6663]/20">
          <h3 className="font-bold text-[#1E6663] mb-2">Strategy Overview</h3>
          <p className="text-gray-700 text-sm leading-relaxed">{lookalike.summary}</p>
        </Card>
      )}

      {/* Recommended Companies Table */}
      {lookalike.recommendedCompanies && lookalike.recommendedCompanies.length > 0 && (
        <div>
          <h3 className="font-bold text-[#1F2A2A] mb-4">
            🏢 Recommended Companies ({lookalike.recommendedCompanies.length})
          </h3>
          <div className="space-y-3">
            {lookalike.recommendedCompanies.map((co, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-[#1E6663] text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <h4 className="font-bold text-[#1F2A2A] text-sm">{co.company}</h4>
                    </div>
                    <div className="flex items-center gap-3 mt-1 ml-8">
                      <a
                        href={`https://${co.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline font-mono"
                      >
                        {co.website}
                      </a>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {co.industry}
                      </span>
                    </div>
                  </div>
                  {co.scores?.overall != null && (
                    <div className="text-right shrink-0">
                      <span
                        className={`text-lg font-black ${
                          co.scores.overall >= 80
                            ? "text-green-600"
                            : co.scores.overall >= 60
                            ? "text-yellow-500"
                            : "text-red-500"
                        }`}
                      >
                        {co.scores.overall}%
                      </span>
                      <p className="text-xs text-gray-400">Overall</p>
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-600 italic ml-8 mb-3">{co.whyTheyMatch}</p>

                {co.scores && (
                  <div className="ml-8 space-y-1.5">
                    <ScoreBar label="Industry" value={co.scores.industryFit} />
                    <ScoreBar label="Size" value={co.scores.sizeFit} />
                    <ScoreBar label="Geography" value={co.scores.geographyFit} />
                    <ScoreBar label="Triggers" value={co.scores.triggerFit} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Account Matching Criteria */}
      {lookalike.criteria && lookalike.criteria.length > 0 && (
        <div>
          <h3 className="font-bold text-[#1F2A2A] mb-4">Account Matching Criteria</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lookalike.criteria.map((cat, i) => (
              <Card key={i}>
                <h4 className="font-semibold text-[#1F2A2A] mb-2">{cat.category}</h4>
                {cat.rationale && (
                  <p className="text-xs text-gray-500 mb-3">{cat.rationale}</p>
                )}
                <ul className="space-y-1.5">
                  {cat.criteria.map((c, j) => (
                    <li key={j} className="text-sm text-gray-700 flex gap-2">
                      <span className="text-[#1E6663] shrink-0">✓</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Search Queries */}
      {lookalike.searchQueries && (
        <div>
          <h3 className="font-bold text-[#1F2A2A] mb-4">Search Queries</h3>
          <div className="space-y-4">
            {lookalike.searchQueries.linkedin && lookalike.searchQueries.linkedin.length > 0 && (
              <Card>
                <h4 className="font-semibold text-[#1F2A2A] mb-3 flex items-center gap-2">
                  <span className="text-blue-600">💼</span> LinkedIn Sales Navigator
                </h4>
                <div className="space-y-2">
                  {lookalike.searchQueries.linkedin.map((q, i) => (
                    <div
                      key={i}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-3 font-mono text-xs text-gray-700 break-all"
                    >
                      {q}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {lookalike.searchQueries.google && lookalike.searchQueries.google.length > 0 && (
              <Card>
                <h4 className="font-semibold text-[#1F2A2A] mb-3 flex items-center gap-2">
                  <span>🔍</span> Google Search Queries
                </h4>
                <div className="space-y-2">
                  {lookalike.searchQueries.google.map((q, i) => (
                    <div
                      key={i}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-3 font-mono text-xs text-gray-700 break-all"
                    >
                      {q}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {lookalike.searchQueries.crunchbase && lookalike.searchQueries.crunchbase.length > 0 && (
              <Card>
                <h4 className="font-semibold text-[#1F2A2A] mb-3 flex items-center gap-2">
                  <span>📊</span> Crunchbase Filters
                </h4>
                <div className="space-y-2">
                  {lookalike.searchQueries.crunchbase.map((q, i) => (
                    <div
                      key={i}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-700"
                    >
                      {q}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Boolean Strings */}
      {lookalike.booleanStrings && lookalike.booleanStrings.length > 0 && (
        <Card>
          <h3 className="font-bold text-[#1F2A2A] mb-3">🔤 Boolean Search Strings</h3>
          <div className="space-y-2">
            {lookalike.booleanStrings.map((str, i) => (
              <div
                key={i}
                className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-xs break-all"
              >
                {str}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
