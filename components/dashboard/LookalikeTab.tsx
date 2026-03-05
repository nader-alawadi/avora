"use client";
import { Card } from "@/components/ui/Card";

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

interface LookalikeData {
  title?: string;
  criteria?: LookalikeCriteria[];
  searchQueries?: SearchQueries;
  booleanStrings?: string[];
  summary?: string;
  disclaimer?: string;
}

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
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="font-semibold text-blue-800 text-sm">
          🔍 Lookalike Search Criteria — No Personal Data
        </p>
        <p className="text-blue-700 text-xs mt-1">
          {lookalike.disclaimer ||
            "These are search criteria and queries only. No specific companies or personal contacts are provided. Use these to build your own targeted lists."}
        </p>
      </div>

      {lookalike.summary && (
        <Card className="bg-[#1E6663]/5 border-[#1E6663]/20">
          <h3 className="font-bold text-[#1E6663] mb-2">Strategy Overview</h3>
          <p className="text-gray-700 text-sm leading-relaxed">{lookalike.summary}</p>
        </Card>
      )}

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
                      <span className="text-[#1E6663]">✓</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      )}

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
