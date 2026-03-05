"use client";
import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/Badge";

interface Dispute {
  id: string;
  reason: string;
  details?: string | null;
  fileUrl?: string | null;
  status: string;
  adminNote?: string | null;
  leadName?: string | null;
  leadTitle?: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
  crmLead?: {
    id: string;
    fullName?: string | null;
    roleTitle?: string | null;
    company?: string | null;
  } | null;
}

function FilePreview({ url }: { url: string }) {
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  const isVideo = /\.(mp4|webm|mov)$/i.test(url);
  const isAudio = /\.(mp3|m4a|wav|ogg|webm)$/i.test(url);

  if (isImage) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        <img src={url} alt="Dispute attachment" className="mt-2 max-h-32 rounded-lg border border-gray-200 object-cover" />
      </a>
    );
  }
  if (isVideo) {
    return (
      <video controls src={url} className="mt-2 max-h-32 rounded-lg border border-gray-200 w-full" />
    );
  }
  if (isAudio) {
    return <audio controls src={url} className="mt-2 w-full" />;
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#1E6663] hover:underline"
    >
      📎 View attachment →
    </a>
  );
}

export function AdminDisputesTab() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [toast, setToast] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/disputes");
    const d = await res.json();
    setDisputes(d.disputes || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function handleAction(disputeId: string, action: "accept" | "reject") {
    setProcessingId(disputeId);
    try {
      const res = await fetch("/api/admin/disputes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          disputeId,
          action,
          adminNote: adminNotes[disputeId] || null,
        }),
      });
      const d = await res.json();
      if (!res.ok) {
        showToast(`❌ ${d.error || "Failed"}`);
        return;
      }
      showToast(action === "accept" ? "✓ Dispute accepted — lead removed" : "✓ Dispute rejected");
      await load();
    } finally {
      setProcessingId(null);
    }
  }

  const STATUS_BADGE: Record<string, "warning" | "danger" | "success"> = {
    Pending: "warning",
    Rejected: "danger",
    Accepted: "success",
  };

  const pending = disputes.filter((d) => d.status === "Pending");
  const resolved = disputes.filter((d) => d.status !== "Pending");

  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-40 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-64" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${
            toast.startsWith("❌") ? "bg-red-600" : "bg-[#1E6663]"
          }`}
        >
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-[#1F2A2A]">Lead Disputes</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {pending.length} pending · {resolved.length} resolved
          </p>
        </div>
        <button onClick={load} className="text-xs text-[#1E6663] hover:underline font-medium">
          Refresh
        </button>
      </div>

      {disputes.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🏳️</div>
          <p className="font-medium">No disputes yet</p>
        </div>
      )}

      {/* Pending disputes */}
      {pending.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Pending ({pending.length})
          </h3>
          <div className="space-y-3">
            {pending.map((dispute) => (
              <div
                key={dispute.id}
                className="bg-white rounded-xl border border-orange-200 p-5 space-y-4"
              >
                {/* Lead + Client info */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-[#1F2A2A] text-sm">
                        {dispute.crmLead?.fullName || dispute.leadName || "Unnamed Lead"}
                      </p>
                      <Badge variant="warning">Pending</Badge>
                    </div>
                    {(dispute.crmLead?.roleTitle || dispute.leadTitle) && (
                      <p className="text-xs text-gray-500">{dispute.crmLead?.roleTitle || dispute.leadTitle}</p>
                    )}
                    {dispute.crmLead?.company && (
                      <p className="text-xs text-[#1E6663] font-medium">{dispute.crmLead.company}</p>
                    )}
                  </div>
                  <div className="text-right text-xs text-gray-400">
                    <p className="font-medium text-gray-600">{dispute.user.name || dispute.user.email}</p>
                    {dispute.user.name && <p>{dispute.user.email}</p>}
                    <p className="mt-0.5">{new Date(dispute.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                {/* Reason + details */}
                <div className="bg-orange-50 rounded-lg px-4 py-3 space-y-1.5">
                  <p className="text-xs font-semibold text-orange-700">
                    Reason: {dispute.reason}
                  </p>
                  {dispute.details && (
                    <p className="text-xs text-gray-600 leading-relaxed">{dispute.details}</p>
                  )}
                  {dispute.fileUrl && <FilePreview url={dispute.fileUrl} />}
                </div>

                {/* Admin note input */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                    Admin Note <span className="normal-case font-normal text-gray-400">(optional, shown to client)</span>
                  </label>
                  <input
                    type="text"
                    value={adminNotes[dispute.id] || ""}
                    onChange={(e) =>
                      setAdminNotes((prev) => ({ ...prev, [dispute.id]: e.target.value }))
                    }
                    placeholder="e.g. We confirmed this is a duplicate"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6663]/30 focus:border-[#1E6663]"
                  />
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleAction(dispute.id, "accept")}
                    disabled={processingId === dispute.id}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    ✅ Accept Dispute
                  </button>
                  <button
                    onClick={() => handleAction(dispute.id, "reject")}
                    disabled={processingId === dispute.id}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    ❌ Reject Dispute
                  </button>
                  {processingId === dispute.id && (
                    <span className="text-xs text-gray-400 ml-1">Processing…</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resolved disputes */}
      {resolved.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Resolved ({resolved.length})
          </h3>
          <div className="space-y-2">
            {resolved.map((dispute) => (
              <div
                key={dispute.id}
                className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-start justify-between gap-4 flex-wrap"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-[#1F2A2A] text-sm">
                      {dispute.crmLead?.fullName || dispute.leadName || "Unnamed Lead"}
                    </p>
                    <Badge variant={STATUS_BADGE[dispute.status] || "default"}>
                      {dispute.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    Client: {dispute.user.name || dispute.user.email} · Reason: {dispute.reason}
                  </p>
                  {dispute.adminNote && (
                    <p className="text-xs text-gray-400 italic">Note: {dispute.adminNote}</p>
                  )}
                </div>
                <p className="text-xs text-gray-400 flex-shrink-0">
                  {new Date(dispute.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
