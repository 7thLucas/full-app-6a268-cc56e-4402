import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { useConfigurables } from "~/modules/configurables";
import {
  useTranscribe,
  TranscriptionUpload,
} from "@qb/audio-analyzer";

// ─── Types ───────────────────────────────────────────────────────────────────

interface InterviewSession {
  _id: string;
  ticketId: string;
  fileName?: string;
  fileSizeBytes?: number;
  status?: string;
  overallScore?: number | null;
  summary?: string | null;
  label?: string;
  createdAt?: string;
}

// ─── Score badge ─────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number | null | undefined }) {
  if (score == null) return null;
  const pct = Math.round(score);
  const color =
    pct >= 75
      ? "text-green-400"
      : pct >= 50
        ? "text-yellow-400"
        : "text-red-400";
  return (
    <span
      className={`font-mono text-lg font-bold tabular-nums ${color}`}
    >
      {pct}
      <span className="ml-0.5 text-xs font-normal text-slate-500">/100</span>
    </span>
  );
}

// ─── Status pill ─────────────────────────────────────────────────────────────

function StatusPill({ status }: { status?: string }) {
  const s = status ?? "queued";
  const cls =
    s === "completed"
      ? "bg-green-950 text-green-400 border-green-800"
      : s === "failed"
        ? "bg-red-950 text-red-400 border-red-800"
        : "bg-blue-950 text-blue-400 border-blue-800";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${cls}`}
    >
      {s !== "completed" && s !== "failed" && (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
      )}
      {s}
    </span>
  );
}

// ─── Format helpers ───────────────────────────────────────────────────────────

function formatBytes(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── History row ─────────────────────────────────────────────────────────────

function HistoryRow({
  session,
  onDelete,
}: {
  session: InterviewSession;
  onDelete: (ticketId: string) => void;
}) {
  const navigate = useNavigate();

  return (
    <tr
      className="group cursor-pointer border-b border-slate-800 transition-colors hover:bg-slate-800/40"
      onClick={() => navigate(`/analysis/${session.ticketId}`)}
    >
      <td className="py-4 pl-4 pr-3">
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-slate-100 line-clamp-1">
            {session.label || session.fileName || session.ticketId}
          </span>
          {session.fileName && session.label && (
            <span className="text-xs text-slate-500 line-clamp-1">
              {session.fileName}
            </span>
          )}
          {session.summary && (
            <span className="mt-0.5 text-xs text-slate-500 line-clamp-1">
              {session.summary}
            </span>
          )}
        </div>
      </td>
      <td className="px-3 py-4 text-right">
        <ScoreBadge score={session.overallScore} />
      </td>
      <td className="px-3 py-4">
        <StatusPill status={session.status} />
      </td>
      <td className="hidden px-3 py-4 text-sm text-slate-500 sm:table-cell">
        {formatBytes(session.fileSizeBytes)}
      </td>
      <td className="hidden px-3 py-4 text-xs text-slate-500 md:table-cell">
        {formatDate(session.createdAt)}
      </td>
      <td className="py-4 pl-3 pr-4 text-right">
        <button
          type="button"
          className="rounded p-1.5 text-slate-600 opacity-0 transition-opacity hover:bg-red-950/60 hover:text-red-400 group-hover:opacity-100"
          title="Delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(session.ticketId);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={14}
            height={14}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </td>
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function IndexPage() {
  const { config, loading: configLoading } = useConfigurables();
  const navigate = useNavigate();

  const { submit, isSubmitting, error: transcribeError } = useTranscribe();

  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // ── Fetch history ──────────────────────────────────────────────────────────
  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/interview-sessions");
      const json = await res.json() as { success: boolean; data: InterviewSession[] };
      if (json.success) setSessions(json.data);
    } catch {
      // ignore network errors on history load
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    void fetchSessions();
  }, [fetchSessions]);

  // ── Upload handler ─────────────────────────────────────────────────────────
  const handleUpload = async (file: File) => {
    setUploadError(null);
    try {
      const result = await submit({ files: file });
      if (!result?.ticket_id) {
        setUploadError("Upload failed — no ticket ID returned.");
        return;
      }

      // Persist the session record
      await fetch("/api/interview-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: result.ticket_id,
          fileName: file.name,
          fileSizeBytes: file.size,
        }),
      });

      // Navigate to the analysis page
      navigate(`/analysis/${result.ticket_id}`);
    } catch (err) {
      setUploadError("Something went wrong during upload. Please try again.");
    }
  };

  // ── Delete handler ─────────────────────────────────────────────────────────
  const handleDelete = async (ticketId: string) => {
    setSessions((prev) => prev.filter((s) => s.ticketId !== ticketId));
    try {
      await fetch(`/api/interview-sessions/${ticketId}`, { method: "DELETE" });
    } catch {
      // best-effort
    }
  };

  const appName = configLoading ? "XINTERVIEWX" : (config.appName ?? "XINTERVIEWX");
  const tagline = configLoading ? "" : (config.tagline ?? "The truth about your hiring process.");
  const uploadHeadline = configLoading
    ? "Upload an interview recording"
    : (config.uploadHeadline ?? "Upload an interview recording");
  const uploadSubtext = configLoading
    ? "Drop a video or audio file — get an AI-powered analysis report instantly"
    : (config.uploadSubtext ??
        "Drop a video or audio file — get an AI-powered analysis report instantly");

  const errorMsg = uploadError ?? transcribeError ?? null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Header ── */}
      <header className="border-b border-border bg-card/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            {config.logoUrl && config.logoUrl !== "FILL_LOGO_URL_HERE" && (
              <img
                src={config.logoUrl}
                alt={appName}
                className="h-8 w-8 rounded object-cover"
              />
            )}
            <span className="text-lg font-extrabold tracking-widest text-white">
              {appName}
            </span>
          </div>
          <p className="hidden text-xs text-slate-500 sm:block">{tagline}</p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-10 px-4 py-10 sm:px-6">
        {/* ── Upload zone ── */}
        <section>
          <div className="mb-3">
            <h1 className="text-2xl font-extrabold uppercase tracking-widest text-white sm:text-3xl">
              {uploadHeadline}
            </h1>
            <p className="mt-1 text-sm text-slate-400">{uploadSubtext}</p>
          </div>

          {errorMsg && (
            <div className="mb-4 rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
              {errorMsg}
            </div>
          )}

          <TranscriptionUpload
            onUpload={handleUpload}
            isLoading={isSubmitting}
            label="Click or drag an interview recording here"
            hint="MP4, MOV, WebM, MP3, WAV — up to 200 MB"
            loadingLabel="Uploading and queuing analysis…"
            draggingLabel="Drop it"
            className="[&>div]:border-border [&>div]:bg-card [&>div]:py-20 [&>div]:transition-all [&>div:hover]:border-blue-500/50 [&>div:hover]:bg-blue-950/20"
          />
        </section>

        {/* ── Interview history ── */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
              Interview History
            </h2>
            {sessions.length > 0 && (
              <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-400">
                {sessions.length}
              </span>
            )}
          </div>

          {loadingSessions ? (
            <div className="flex items-center justify-center py-16 text-slate-600 text-sm">
              Loading…
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mb-3 h-10 w-10 text-slate-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10l4.553-2.069A1 1 0 0121 8.868v6.264a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
                />
              </svg>
              <p className="text-sm font-medium text-slate-500">No interviews analyzed yet</p>
              <p className="mt-1 text-xs text-slate-600">Upload a recording above to get started</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-slate-500">
                    <th className="py-3 pl-4 pr-3 font-semibold">Interview</th>
                    <th className="px-3 py-3 text-right font-semibold">Score</th>
                    <th className="px-3 py-3 font-semibold">Status</th>
                    <th className="hidden px-3 py-3 font-semibold sm:table-cell">Size</th>
                    <th className="hidden px-3 py-3 font-semibold md:table-cell">Date</th>
                    <th className="py-3 pl-3 pr-4" />
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <HistoryRow
                      key={session.ticketId}
                      session={session}
                      onDelete={handleDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
