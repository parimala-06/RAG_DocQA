"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MAX_FILE_SIZE_MB, MAX_FILE_SIZE_BYTES } from "@/lib/constants";
import GuidedTour, { useTourVisibility } from "@/components/GuidedTour";

const CONFIRM_DELETE_TIMEOUT_MS = 4000;

export default function Home() {
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const [question, setQuestion] = useState("");
  const [thread, setThread] = useState([]);
  const [asking, setAsking] = useState(false);
  const [openSource, setOpenSource] = useState(null);

  const [summary, setSummary] = useState(null); // { documentId, filename, loading, text, error }

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const fileInputRef = useRef(null);
  const confirmTimeoutRef = useRef(null);
  const uploadZoneRef = useRef(null);
  const askFormRef = useRef(null);

  const {
    active: tourActive,
    dismiss: dismissTour,
    replay: replayTour,
  } = useTourVisibility();

  useEffect(() => {
    async function loadDocuments() {
      try {
        const res = await fetch("/api/documents", { cache: "no-store" });
        const data = await res.json();
        if (res.ok) setDocuments(data.documents);
      } catch {
        // Non-fatal — the list just stays empty; uploading still works.
      } finally {
        setDocumentsLoading(false);
      }
    }
    loadDocuments();
    return () => clearTimeout(confirmTimeoutRef.current);
  }, []);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape" && summary) setSummary(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [summary]);

  const uploadFile = useCallback(async (file) => {
    if (!file) return;

    if (file.type !== "application/pdf") {
      setUploadError("Please choose a PDF file.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setUploadError(
        `File is too large — the maximum size is ${MAX_FILE_SIZE_MB}MB.`,
      );
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      setDocuments((prev) => [
        ...prev,
        {
          id: data.documentId,
          filename: data.filename,
          chunkCount: data.chunkCount,
          hasFile: data.hasFile,
        },
      ]);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, []);

  function handleFileInputChange(e) {
    uploadFile(e.target.files?.[0]);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragActive(false);
    if (uploading) return;
    uploadFile(e.dataTransfer.files?.[0]);
  }

  async function handleSummarize(doc) {
    setSummary({
      documentId: doc.id,
      filename: doc.filename,
      loading: true,
      text: null,
      error: null,
    });

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: doc.id }),
      });
      const data = await res.json();

      if (!res.ok)
        throw new Error(data.error || "Couldn't summarize this document");

      setSummary({
        documentId: doc.id,
        filename: doc.filename,
        loading: false,
        text: data.summary,
        error: null,
      });
    } catch (err) {
      setSummary({
        documentId: doc.id,
        filename: doc.filename,
        loading: false,
        text: null,
        error: err.message,
      });
    }
  }

  function handleDeleteClick(doc) {
    setDeleteError(null);

    if (confirmDeleteId !== doc.id) {
      setConfirmDeleteId(doc.id);
      clearTimeout(confirmTimeoutRef.current);
      confirmTimeoutRef.current = setTimeout(
        () => setConfirmDeleteId(null),
        CONFIRM_DELETE_TIMEOUT_MS,
      );
      return;
    }

    clearTimeout(confirmTimeoutRef.current);
    handleDeleteConfirmed(doc);
  }

  async function handleDeleteConfirmed(doc) {
    setConfirmDeleteId(null);
    setDeletingId(doc.id);

    try {
      const res = await fetch(`/api/documents/${doc.id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok)
        throw new Error(data.error || "Couldn't delete this document");

      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    } catch (err) {
      setDeleteError(`${doc.filename}: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleAsk(e) {
    e.preventDefault();
    if (!question.trim() || asking) return;

    const q = question.trim();
    setQuestion("");
    setAsking(true);
    setThread((prev) => [...prev, { role: "question", text: q }]);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Something went wrong");

      setThread((prev) => [
        ...prev,
        { role: "answer", text: data.answer, sources: data.sources },
      ]);
    } catch (err) {
      setThread((prev) => [
        ...prev,
        { role: "answer", text: `Error: ${err.message}`, sources: [] },
      ]);
    } finally {
      setAsking(false);
    }
  }

  function renderAnswerWithCitations(text, sources, threadIndex) {
    const parts = text.split(/(\[\d+\])/g);
    return parts.map((part, i) => {
      const match = part.match(/^\[(\d+)\]$/);
      if (!match) return <span key={i}>{part}</span>;

      const idx = parseInt(match[1], 10);
      const source = sources.find((s) => s.index === idx);
      if (!source) return <span key={i}>{part}</span>;

      const key = `${threadIndex}-${idx}`;
      return (
        <button
          key={i}
          onClick={() => setOpenSource(openSource === key ? null : key)}
          className="citation-marker focus-ring"
          aria-label={`Show source excerpt ${idx}`}
          aria-expanded={openSource === key}
        >
          {idx}
        </button>
      );
    });
  }

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-cream text-ink font-sans">
      {/* Left pane — the document index */}
      <aside className="md:w-80 md:h-screen md:sticky md:top-0 bg-night text-mist p-6 flex flex-col gap-6 md:overflow-y-auto border-b md:border-b-0 md:border-r border-night-rule">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              className="text-teal shrink-0"
              aria-hidden="true"
            >
              <path
                d="M4 4.5C4 3.67 4.67 3 5.5 3H15l5 5v12.5c0 .83-.67 1.5-1.5 1.5h-14C3.67 22 3 21.33 3 20.5v-16Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M15 3v5h5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M7.5 12.5h9M7.5 16h6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-mist">
              Archive
            </h1>
          </div>
          <button
            onClick={replayTour}
            className="text-xs font-bold uppercase tracking-wide rounded-full border border-teal/40 text-teal px-3 py-1.5 hover:bg-teal hover:text-night transition-colors focus-ring shrink-0"
            aria-label="Replay the guided tour"
          >
            Guide
          </button>
        </div>
        <p className="text-sm text-muted-dark -mt-4">
          Upload a document, ask it questions, trace every answer back to its
          source.
        </p>

        <div>
          <span className="block text-xs font-bold uppercase tracking-wide text-muted-dark mb-2">
            Add a document
          </span>
          <div
            ref={uploadZoneRef}
            onDragOver={(e) => {
              e.preventDefault();
              if (!uploading) setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`relative rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-colors focus-within:ring-2 focus-within:ring-teal/50 focus-within:ring-offset-2 focus-within:ring-offset-night ${
              dragActive
                ? "border-teal bg-teal/10 shadow-glow"
                : "border-night-rule hover:border-teal/60"
            } ${uploading ? "opacity-90" : ""}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileInputChange}
              disabled={uploading}
              aria-label="Upload a PDF document"
              className="absolute inset-0 h-full w-full opacity-0 cursor-pointer disabled:cursor-not-allowed focus:outline-none"
            />
            <div className="pointer-events-none flex flex-col items-center gap-2">
              {uploading ? (
                <>
                  <span
                    className="w-2 h-2 rounded-full bg-teal pulse-dot"
                    aria-hidden="true"
                  />
                  <span className="text-sm font-bold text-mist">
                    Reading &amp; embedding
                  </span>
                  <span className="text-[11px] text-muted-dark tabular">
                    Status: indexing…
                  </span>
                </>
              ) : (
                <>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    className="text-teal"
                  >
                    <path
                      d="M12 16V4m0 0 4 4m-4-4-4 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="text-sm font-semibold text-mist">
                    Drop a PDF here, or click to browse
                  </p>
                </>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-dark tabular mt-1.5">
            Maximum file size: {MAX_FILE_SIZE_MB}MB
          </p>
        </div>

        <div className="text-sm min-h-[1.25rem]" aria-live="polite">
          {uploadError && (
            <p className="text-alert font-semibold">{uploadError}</p>
          )}
          {deleteError && (
            <p className="text-alert font-semibold">
              Couldn't delete {deleteError}
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto -mr-2 pr-2">
          <span className="block text-xs font-bold uppercase tracking-wide text-muted-dark mb-2">
            Documents ({documents.length})
          </span>
          {documentsLoading ? (
            <p className="text-sm text-muted-dark">Loading…</p>
          ) : documents.length === 0 ? (
            <p className="text-sm text-muted-dark">Nothing uploaded yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {documents.map((doc, i) => {
                const isConfirming = confirmDeleteId === doc.id;
                const isDeleting = deletingId === doc.id;
                const isSummarizing =
                  summary?.documentId === doc.id && summary?.loading;
                return (
                  <li
                    key={doc.id ?? i}
                    className="rounded-xl bg-night-elevated border border-night-rule p-3 hover:border-teal/50 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-night text-muted-dark text-[10px] tabular mt-0.5 shrink-0">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div
                            className="truncate min-w-0 font-bold text-mist"
                            title={doc.filename}
                          >
                            {doc.filename}
                          </div>
                          {doc.hasFile && (
                            <a
                              href={`/api/documents/${doc.id}/file`}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Preview ${doc.filename} in a new tab`}
                              title="Preview original PDF"
                              className="shrink-0 text-muted-dark hover:text-teal transition-colors focus-ring p-0.5"
                            >
                              <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                aria-hidden="true"
                              >
                                <path
                                  d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinejoin="round"
                                />
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="3"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                />
                              </svg>
                            </a>
                          )}
                        </div>
                        <div className="text-xs text-muted-dark tabular mt-0.5">
                          {doc.chunkCount} chunks
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 mt-2.5">
                      <button
                        onClick={() => handleSummarize(doc)}
                        disabled={isSummarizing || isDeleting}
                        className="text-[11px] font-bold uppercase tracking-wide rounded-full border border-night-rule text-muted-dark px-2.5 py-1 hover:border-teal hover:text-teal transition-colors disabled:opacity-40 focus-ring"
                      >
                        {isSummarizing ? "…" : "Summarize"}
                      </button>

                      <button
                        onClick={() => handleDeleteClick(doc)}
                        disabled={isDeleting}
                        aria-label={
                          isConfirming
                            ? `Confirm delete ${doc.filename}`
                            : `Delete ${doc.filename}`
                        }
                        title={
                          isConfirming
                            ? "Click again to confirm"
                            : "Delete document"
                        }
                        className={`text-[11px] font-bold uppercase tracking-wide rounded-full px-2.5 py-1 transition-colors disabled:opacity-40 focus-ring border ${
                          isConfirming
                            ? "border-alert bg-alert text-mist"
                            : "border-night-rule text-muted-dark hover:border-alert hover:text-alert"
                        }`}
                      >
                        {isDeleting
                          ? "…"
                          : isConfirming
                            ? "Confirm?"
                            : "Delete"}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      {summary && (
        <div
          className="fixed inset-0 bg-night/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSummary(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="summary-heading"
        >
          <div
            className="bg-paper text-ink rounded-2xl shadow-card max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 px-8 pt-6 pb-4 shrink-0 border-b border-ink/10">
              <div className="min-w-0">
                <div className="text-xs font-bold uppercase tracking-wide text-teal-deep mb-1">
                  Summary
                </div>
                <h2
                  id="summary-heading"
                  className="font-sans text-xl font-bold truncate"
                >
                  {summary.filename}
                </h2>
              </div>
              <button
                onClick={() => setSummary(null)}
                className="rounded-full w-8 h-8 flex items-center justify-center text-muted hover:bg-alert-tint hover:text-alert transition-colors focus-ring shrink-0"
                aria-label="Close summary"
              >
                ✕
              </button>
            </div>

            <div
              className="summary-scroll overflow-y-auto px-8 py-6"
              aria-live="polite"
            >
              {summary.loading && (
                <p className="text-sm text-muted">
                  Reading the whole document…
                </p>
              )}
              {summary.error && (
                <p className="text-sm text-alert font-semibold">
                  {summary.error}
                </p>
              )}
              {summary.text && (
                <p className="text-base leading-relaxed whitespace-pre-wrap">
                  {summary.text}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Right pane — the Q&A thread */}
      <section className="flex-1 flex flex-col p-6 md:p-10 min-h-screen">
        <div className="flex-1 space-y-6 overflow-y-auto">
          {thread.length === 0 && (
            <div className="max-w-lg">
              <p className="font-display text-3xl md:text-4xl font-extrabold text-ink leading-[1.05] tracking-tight">
                Ask anything about what you&apos;ve uploaded.
              </p>
              <p className="text-muted mt-3 text-base">
                Every answer cites the exact passage it came from — tap the
                marker to check it.
              </p>
            </div>
          )}

          {thread.map((entry, i) =>
            entry.role === "question" ? (
              <div key={i} className="flex justify-end">
                <div className="max-w-[85%] md:max-w-[70%]">
                  <div className="text-right text-xs font-bold uppercase tracking-wide text-teal-deep mb-1 pr-1">
                    You
                  </div>
                  <div className="bg-night text-mist rounded-2xl rounded-br-none px-4 py-2 text-base leading-snug shadow-glow">
                    {entry.text}
                  </div>
                </div>
              </div>
            ) : (
              <div key={i} className="flex justify-start">
                <div className="max-w-[90%] md:max-w-[75%]">
                  <div className="text-xs font-bold uppercase tracking-wide text-teal-deep mb-1 pl-1">
                    Archive
                  </div>
                  <div className="bg-paper text-ink rounded-2xl rounded-bl-none border border-teal px-5 py-4 text-[15px] leading-normal shadow-card">
                    {renderAnswerWithCitations(
                      entry.text,
                      entry.sources || [],
                      i,
                    )}

                    {entry.sources?.map((source) => {
                      const key = `${i}-${source.index}`;
                      if (openSource !== key) return null;
                      return (
                        <div
                          key={key}
                          className="excerpt-panel mt-3 bg-teal-tint rounded-xl p-3 text-sm text-ink"
                        >
                          <div className="text-xs font-bold mb-1 text-teal-deep tabular">
                            Source {source.index} · {source.filename}
                          </div>
                          {source.excerpt}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ),
          )}

          {asking && (
            <div className="flex justify-start" aria-live="polite">
              <div className="bg-paper rounded-2xl rounded-bl-none px-5 py-3 shadow-card">
                <span className="text-sm font-bold text-ink">
                  Searching
                  <span className="searching-dots" aria-hidden="true">
                    <span>.</span>
                    <span>.</span>
                    <span>.</span>
                  </span>
                </span>
              </div>
            </div>
          )}
        </div>

        <form
          ref={askFormRef}
          onSubmit={handleAsk}
          className="mt-6 flex items-center gap-1.5 rounded-full bg-paper shadow-card p-1.5 focus-within:ring-2 focus-within:ring-teal/50"
        >
          <label htmlFor="question-input" className="sr-only">
            Ask a question about your documents
          </label>
          <input
            id="question-input"
            type="text"
            autoComplete="off"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about your documents…"
            className="flex-1 bg-transparent border-none px-4 py-2.5 placeholder:text-muted focus:outline-none"
          />
          <button
            type="submit"
            disabled={asking}
            className="flex items-center gap-1 bg-night text-mist rounded-full px-4 py-2 text-sm font-bold hover:bg-teal hover:text-night transition-colors focus-ring shrink-0 disabled:bg-night-elevated disabled:text-muted-dark disabled:pointer-events-none"
          >
            Ask
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M5 12h14m0 0-6-6m6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </form>
      </section>

      <GuidedTour
        active={tourActive}
        onDismiss={dismissTour}
        targets={[uploadZoneRef, askFormRef]}
      />
    </main>
  );
}
