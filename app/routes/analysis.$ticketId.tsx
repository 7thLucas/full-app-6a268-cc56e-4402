import { useEffect } from "react";
import { useParams, Link } from "react-router";
import { useConfigurables } from "~/modules/configurables";
import { TranscriptionResult } from "@qb/audio-analyzer";
import { useTranscriptionResultContext } from "@qb/audio-analyzer";

// ─── Overall score hero ───────────────────────────────────────────────────────

function OverallScoreHero() {
  const { overallScore, scoreCards, result } = useTranscriptionResultContext();

  const score =
    overallScore !== null ? Math.round(overallScore) : null;

  const color =
    score == null
      ? "text-slate-400"
      : score >= 75
        ? "text-green-400"
        : score >= 50
          ? "text-yellow-400"
          : "text-red-400";

  const label =
    score == null
      ? "—"
      : score >= 75
        ? "Strong"
        : score >= 50
          ? "Average"
          : "Weak";

  const totalCategories = scoreCards.length;

  return (
    <div className="flex flex-col items-start gap-4 rounded-xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Overall Interview Score
        </p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className={`font-mono text-7xl font-black tabular-nums leading-none ${color}`}>
            {score ?? "—"}
          </span>
          {score != null && (
            <span className="text-lg font-medium text-slate-500">/100</span>
          )}
        </div>
        <p className={`mt-1 text-sm font-semibold ${color}`}>{label}</p>
      </div>

      <div className="flex flex-col gap-1 text-right text-sm text-slate-500">
        <span>{totalCategories} scoring dimensions</span>
        {result?.status && (
          <span className="capitalize">{result.status}</span>
        )}
      </div>
    </div>
  );
}

// ─── Sync session back to db ──────────────────────────────────────────────────

function SessionSyncer({ ticketId }: { ticketId: string }) {
  const { result, isCompleted, overallScore } = useTranscriptionResultContext();

  useEffect(() => {
    if (!result) return;

    void fetch(`/api/interview-sessions/${ticketId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: result.status,
        overallScore: isCompleted ? overallScore : undefined,
        summary: isCompleted ? (result.analysis?.summary ?? null) : undefined,
      }),
    });
  }, [result?.status, isCompleted, overallScore, ticketId]);

  return null;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalysisPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const { config, loading: configLoading } = useConfigurables();

  const appName = configLoading ? "XINTERVIEWX" : (config.appName ?? "XINTERVIEWX");
  const showTranscript = configLoading ? true : (config.showTranscript ?? true);
  const showMedia = configLoading ? true : (config.showMedia ?? true);
  const showLogs = configLoading ? false : (config.showLogs ?? false);

  if (!ticketId) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        Invalid analysis link.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Header ── */}
      <header className="border-b border-border bg-card/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-4 sm:px-6">
          <Link
            to="/"
            className="rounded p-1.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-white"
            aria-label="Back to home"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={18}
              height={18}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="text-base font-extrabold tracking-widest text-white">
            {appName}
          </span>
          <span className="text-slate-600">/</span>
          <span className="truncate font-mono text-xs text-slate-500">{ticketId}</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
        <TranscriptionResult ticketId={ticketId}>
          {/* Sync to DB while polling */}
          <TranscriptionResult.Content>
            <SessionSyncer ticketId={ticketId} />
          </TranscriptionResult.Content>

          {/* Loading state */}
          <TranscriptionResult.Loading />

          {/* Error state */}
          <TranscriptionResult.Error />

          {/* Analysis content */}
          <TranscriptionResult.Content>
            {/* Score hero */}
            <OverallScoreHero />

            {/* Category scores */}
            <TranscriptionResult.Scores className="mt-6" />

            {/* Header with status */}
            <div className="mt-6 flex items-center justify-between">
              <TranscriptionResult.Header
                title="Analysis Report"
                className="flex-1"
              />
              <TranscriptionResult.Status />
            </div>

            {/* Processing stage pill */}
            <TranscriptionResult.Stage className="mt-2" />

            {/* Summary */}
            <TranscriptionResult.Summary
              title="Interview Summary"
              className="mt-4"
            />

            {/* Issues */}
            <TranscriptionResult.Issues className="mt-4" />

            {/* Strengths */}
            <TranscriptionResult.Strengths className="mt-4" />

            {/* Media player */}
            {showMedia && <TranscriptionResult.Media className="mt-4" />}

            {/* Transcript */}
            {showTranscript && <TranscriptionResult.Transcript className="mt-4" />}

            {/* Processing logs */}
            {showLogs && <TranscriptionResult.Logs className="mt-4" />}
          </TranscriptionResult.Content>
        </TranscriptionResult>
      </main>
    </div>
  );
}
