"use client";
import { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ────────────────────────────────────────────────

interface CrmActivity {
  id: string;
  type: string;
  description: string;
  createdAt: string;
}

interface CrmLead {
  id: string;
  fullName?: string;
  roleTitle?: string;
  company?: string;
  linkedinUrl?: string;
  email?: string;
  phone?: string;
  personalityType?: string;
  personalityAnalysisUrl?: string;
  buyingRole?: string;
  preferredChannel?: string;
  seniorityLevel?: string;
  country?: string;
  techStacks?: string;
  whatsappAvailable: boolean;
  stage: string;
  notes?: string;
  nextFollowUp?: string;
  createdAt: string;
  activities: CrmActivity[];
}

// ── Stages ───────────────────────────────────────────────

const STAGES = [
  { id: "NewLead",      label: "New Lead",       color: "#1E6663", bg: "bg-[#1E6663]",   light: "bg-[#1E6663]/8  border-[#1E6663]/20" },
  { id: "Contacted",   label: "Contacted",      color: "#2563eb", bg: "bg-blue-600",    light: "bg-blue-50       border-blue-200" },
  { id: "Qualified",   label: "Qualified",      color: "#0891b2", bg: "bg-cyan-600",    light: "bg-cyan-50       border-cyan-200" },
  { id: "ProposalSent",label: "Proposal Sent",  color: "#7c3aed", bg: "bg-purple-600",  light: "bg-purple-50     border-purple-200" },
  { id: "Negotiation", label: "Negotiation",    color: "#d97706", bg: "bg-amber-500",   light: "bg-amber-50      border-amber-200" },
  { id: "Won",         label: "Won",            color: "#16a34a", bg: "bg-green-600",   light: "bg-green-50      border-green-200" },
  { id: "Lost",        label: "Lost",           color: "#dc2626", bg: "bg-red-600",     light: "bg-red-50        border-red-200" },
];

// ── Lead Card ────────────────────────────────────────────

function LeadCard({
  lead,
  index,
  onClick,
}: {
  lead: CrmLead;
  index: number;
  onClick: () => void;
}) {
  return (
    <Draggable draggableId={lead.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`bg-white rounded-xl border border-gray-100 p-3.5 cursor-pointer select-none transition-shadow ${
            snapshot.isDragging ? "shadow-xl rotate-1 scale-[1.02]" : "shadow-sm hover:shadow-md"
          }`}
        >
          <p className="font-semibold text-[#1F2A2A] text-sm truncate leading-snug">
            {lead.fullName || "Unnamed Lead"}
          </p>
          {lead.roleTitle && (
            <p className="text-xs text-gray-500 truncate mt-0.5">{lead.roleTitle}</p>
          )}
          {lead.company && (
            <p className="text-xs text-[#1E6663] font-medium truncate mt-1">{lead.company}</p>
          )}

          {/* Contact chips */}
          <div className="flex gap-1.5 mt-2.5 flex-wrap">
            {lead.email && (
              <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                ✉ Email
              </span>
            )}
            {lead.phone && (
              <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                📞 Phone
              </span>
            )}
            {lead.linkedinUrl && (
              <span className="text-[10px] bg-blue-50 text-[#0a66c2] px-2 py-0.5 rounded-full">
                in LinkedIn
              </span>
            )}
            {lead.nextFollowUp && (
              <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">
                📅 {new Date(lead.nextFollowUp).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}

// ── Lead Drawer ──────────────────────────────────────────

function LeadDrawer({
  lead,
  onClose,
  onUpdate,
  readOnly = false,
}: {
  lead: CrmLead;
  onClose: () => void;
  onUpdate: (updated: CrmLead) => void;
  readOnly?: boolean;
}) {
  const [notes, setNotes] = useState(lead.notes || "");
  const [stage, setStage] = useState(lead.stage);
  const [followUp, setFollowUp] = useState(
    lead.nextFollowUp ? lead.nextFollowUp.split("T")[0] : ""
  );
  const [saving, setSaving] = useState(false);

  async function save(overrides?: Partial<{ stage: string; notes: string; nextFollowUp: string }>) {
    setSaving(true);
    try {
      const body: Record<string, unknown> = { id: lead.id };
      if (overrides?.stage !== undefined) body.stage = overrides.stage;
      else if (stage !== lead.stage) body.stage = stage;
      if (overrides?.notes !== undefined) body.notes = overrides.notes;
      else if (notes !== lead.notes) body.notes = notes;
      if (overrides?.nextFollowUp !== undefined) {
        body.nextFollowUp = overrides.nextFollowUp || null;
      } else if (followUp !== (lead.nextFollowUp ? lead.nextFollowUp.split("T")[0] : "")) {
        body.nextFollowUp = followUp || null;
      }

      const res = await fetch("/api/crm", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (res.ok && d.lead) {
        onUpdate(d.lead);
        if (overrides?.stage !== undefined) setStage(overrides.stage);
      }
    } finally {
      setSaving(false);
    }
  }

  const ACTIVITY_ICONS: Record<string, string> = {
    lead_created: "✨",
    stage_change: "↗️",
    note_updated: "📝",
    follow_up_set: "📅",
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="fixed right-0 top-0 bottom-0 w-[420px] bg-white shadow-2xl z-50 flex flex-col border-l border-gray-100"
    >
      {/* Header */}
      <div className="flex items-start justify-between p-5 border-b border-gray-100">
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-[#1F2A2A] text-base truncate">
            {lead.fullName || "Unnamed Lead"}
          </h2>
          {lead.roleTitle && <p className="text-sm text-gray-500 mt-0.5 truncate">{lead.roleTitle}</p>}
          {lead.company && <p className="text-sm text-[#1E6663] font-medium mt-0.5">{lead.company}</p>}
        </div>
        <button
          onClick={onClose}
          className="ml-3 w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Contact info */}
        <section>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Contact Info
          </h3>
          <div className="space-y-2">
            {[
              { label: "Email", value: lead.email, href: lead.email ? `mailto:${lead.email}` : undefined },
              { label: "Phone", value: lead.phone, href: lead.phone ? `tel:${lead.phone}` : undefined },
              { label: "LinkedIn", value: lead.linkedinUrl ? "View Profile →" : undefined, href: lead.linkedinUrl || undefined },
              { label: "Country", value: lead.country },
              { label: "Seniority", value: lead.seniorityLevel },
              { label: "Buying Role", value: lead.buyingRole },
              { label: "Personality", value: lead.personalityType },
              { label: "Channel", value: lead.preferredChannel },
              { label: "Tech Stack", value: lead.techStacks },
              { label: "WhatsApp", value: lead.whatsappAvailable ? "Available ✓" : "Not listed" },
            ]
              .filter((r) => r.value)
              .map((row) => (
                <div key={row.label} className="flex items-start gap-3">
                  <span className="text-xs text-gray-400 w-24 flex-shrink-0 pt-0.5">{row.label}</span>
                  {row.href ? (
                    <a
                      href={row.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#1E6663] hover:underline break-all"
                    >
                      {row.value}
                    </a>
                  ) : (
                    <span className="text-sm text-[#1F2A2A] break-words">{row.value}</span>
                  )}
                </div>
              ))}
            {lead.personalityAnalysisUrl && (
              <div className="flex items-start gap-3">
                <span className="text-xs text-gray-400 w-24 flex-shrink-0 pt-0.5">Analysis</span>
                <a
                  href={lead.personalityAnalysisUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#1E6663] hover:underline"
                >
                  View Analysis →
                </a>
              </div>
            )}
          </div>
        </section>

        {/* Stage selector */}
        <section>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Stage</h3>
          <select
            value={stage}
            disabled={readOnly}
            onChange={(e) => {
              if (readOnly) return;
              setStage(e.target.value);
              save({ stage: e.target.value });
            }}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6663]/30 focus:border-[#1E6663] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </section>

        {/* Follow-up date */}
        <section>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Next Follow-Up
          </h3>
          <input
            type="date"
            value={followUp}
            disabled={readOnly}
            onChange={(e) => { if (!readOnly) setFollowUp(e.target.value); }}
            onBlur={() => { if (!readOnly) save({ nextFollowUp: followUp }); }}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6663]/30 focus:border-[#1E6663] disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </section>

        {/* Notes */}
        <section>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Notes</h3>
          <textarea
            value={notes}
            readOnly={readOnly}
            onChange={(e) => { if (!readOnly) setNotes(e.target.value); }}
            rows={4}
            placeholder={readOnly ? "No notes" : "Add notes about this lead..."}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6663]/30 focus:border-[#1E6663] resize-none disabled:opacity-60"
          />
          {!readOnly && (
            <button
              onClick={() => save({ notes })}
              disabled={saving || notes === (lead.notes || "")}
              className="mt-2 text-xs font-semibold text-[#1E6663] hover:underline disabled:opacity-40 disabled:no-underline"
            >
              {saving ? "Saving…" : "Save Notes"}
            </button>
          )}
          {readOnly && <p className="text-[10px] text-gray-400 mt-1">Read-only access</p>}
        </section>

        {/* Activity log */}
        <section>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Activity Log
          </h3>
          {lead.activities.length === 0 ? (
            <p className="text-xs text-gray-400">No activity yet.</p>
          ) : (
            <div className="space-y-2">
              {[...lead.activities].reverse().map((act) => (
                <div key={act.id} className="flex items-start gap-2.5">
                  <span className="text-base flex-shrink-0 mt-0.5">
                    {ACTIVITY_ICONS[act.type] || "•"}
                  </span>
                  <div>
                    <p className="text-xs text-[#1F2A2A] leading-snug">{act.description}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {new Date(act.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </motion.div>
  );
}

// ── CRM Tab (main) ───────────────────────────────────────

export function CrmTab({ readOnly = false }: { readOnly?: boolean }) {
  const [columns, setColumns] = useState<Record<string, CrmLead[]>>(() =>
    Object.fromEntries(STAGES.map((s) => [s.id, []]))
  );
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<CrmLead | null>(null);

  const fetchLeads = useCallback(() => {
    fetch("/api/crm")
      .then((r) => r.json())
      .then((d) => {
        const grouped: Record<string, CrmLead[]> = Object.fromEntries(
          STAGES.map((s) => [s.id, []])
        );
        for (const lead of d.leads ?? []) {
          if (grouped[lead.stage]) {
            grouped[lead.stage].push(lead);
          } else {
            grouped["NewLead"].push(lead);
          }
        }
        setColumns(grouped);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchLeads();
    // Poll every 30 seconds so newly delivered leads appear without a manual page refresh
    const interval = setInterval(fetchLeads, 30_000);
    return () => clearInterval(interval);
  }, [fetchLeads]);

  function onDragEnd(result: DropResult) {
    if (readOnly) return; // Viewer: no drag
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const srcStage = source.droppableId;
    const dstStage = destination.droppableId;

    // Optimistic update
    setColumns((prev) => {
      const srcList = Array.from(prev[srcStage] ?? []);
      const dstList = Array.from(prev[dstStage] ?? []);
      const [moved] = srcList.splice(source.index, 1);
      if (!moved) return prev;
      moved.stage = dstStage;
      if (srcStage === dstStage) {
        srcList.splice(destination.index, 0, moved);
        return { ...prev, [srcStage]: srcList };
      }
      dstList.splice(destination.index, 0, moved);
      return { ...prev, [srcStage]: srcList, [dstStage]: dstList };
    });

    // Persist to API
    if (srcStage !== dstStage) {
      fetch("/api/crm", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: draggableId, stage: dstStage }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.lead) {
            // Update the lead with fresh activities
            setColumns((prev) => {
              const updated = { ...prev };
              for (const stage of Object.keys(updated)) {
                updated[stage] = updated[stage].map((l) =>
                  l.id === d.lead.id ? d.lead : l
                );
              }
              return updated;
            });
            // Update drawer if open
            setSelectedLead((prev) => (prev?.id === d.lead.id ? d.lead : prev));
          }
        })
        .catch(() => {});
    }
  }

  function handleLeadUpdate(updated: CrmLead) {
    setSelectedLead(updated);
    setColumns((prev) => {
      const next: Record<string, CrmLead[]> = {};
      for (const [stageId, leads] of Object.entries(prev)) {
        next[stageId] = leads.filter((l) => l.id !== updated.id);
      }
      if (!next[updated.stage]) next[updated.stage] = [];
      next[updated.stage] = [updated, ...next[updated.stage]];
      return next;
    });
  }

  const totalLeads = Object.values(columns).reduce((s, l) => s + l.length, 0);

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((s) => (
          <div key={s.id} className="w-64 flex-shrink-0 bg-gray-50 rounded-xl p-3 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
            {[0, 1].map((i) => (
              <div key={i} className="h-20 bg-white rounded-xl border border-gray-100 animate-pulse" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (totalLeads === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">👥</div>
        <h3 className="font-bold text-[#1F2A2A] text-lg mb-2">CRM is empty</h3>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">
          Your CRM will be populated automatically when leads are delivered by the AVORA team.
          Place a lead order to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Overlay for drawer */}
      <AnimatePresence>
        {selectedLead && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setSelectedLead(null)}
            />
            <LeadDrawer
              lead={selectedLead}
              onClose={() => setSelectedLead(null)}
              onUpdate={handleLeadUpdate}
              readOnly={readOnly}
            />
          </>
        )}
      </AnimatePresence>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[#1F2A2A] text-lg">My CRM Pipeline</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">{totalLeads} lead{totalLeads !== 1 ? "s" : ""} total</span>
            <button
              onClick={fetchLeads}
              className="text-xs text-[#1E6663] hover:underline font-medium"
            >
              Refresh
            </button>
          </div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: 500 }}>
            {STAGES.map((stage) => {
              const leads = columns[stage.id] ?? [];
              const isWon = stage.id === "Won";
              const isLost = stage.id === "Lost";

              return (
                <div
                  key={stage.id}
                  className={`flex-shrink-0 w-60 flex flex-col rounded-xl border ${
                    isWon
                      ? "bg-green-50 border-green-200"
                      : isLost
                      ? "bg-red-50 border-red-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  {/* Column header */}
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: stage.color }}
                      />
                      <span
                        className={`text-xs font-bold ${
                          isWon ? "text-green-700" : isLost ? "text-red-700" : "text-gray-700"
                        }`}
                      >
                        {stage.label}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        isWon
                          ? "bg-green-200 text-green-800"
                          : isLost
                          ? "bg-red-200 text-red-800"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {leads.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 px-2 pb-2 space-y-2 transition-colors rounded-b-xl ${
                          snapshot.isDraggingOver ? "bg-[#1E6663]/5" : ""
                        }`}
                        style={{ minHeight: 80 }}
                      >
                        {leads.map((lead, index) => (
                          <LeadCard
                            key={lead.id}
                            lead={lead}
                            index={index}
                            onClick={() => setSelectedLead(lead)}
                          />
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </>
  );
}
