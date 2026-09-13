"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MAX_FILE_SIZE_MB, MAX_FILE_SIZE_BYTES } from "@/lib/constants";

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
      setUploadError(`File is too large — the maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      setDocuments((prev) => [
        ...prev,
        { id: data.documentId, filename: data.filename, chunkCount: data.chunkCount, hasFile: data.hasFile },
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
    setSummary({ documentId: doc.id, filename: doc.filename, loading: true, text: null, error: null });

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: doc.id }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Couldn't summarize this document");

      setSummary({ documentId: doc.id, filename: doc.filename, loading: false, text: data.summary, error: null });
    } catch (err) {
      setSummary({ documentId: doc.id, filename: doc.filename, loading: false, text: null, error: err.message });
    }
  }

  function handleDeleteClick(doc) {
    setDeleteError(null);

    if (confirmDeleteId !== doc.id) {
      setConfirmDeleteId(doc.id);
      clearTimeout(confirmTimeoutRef.current);
      confirmTimeoutRef.current = setTimeout(() => setConfirmDeleteId(null), CONFIRM_DELETE_TIMEOUT_MS);
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

      if (!res.ok) throw new Error(data.error || "Couldn't delete this document");

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
          className="citation-marker ml-0.5 focus-ring rounded"
          aria-label={`Show source excerpt ${idx}`}
          aria-expanded={openSource === key}
        >
          [{idx}]
        </button>
      );
    });
  }

  return (
    <main className="min-h-screen flex flex-col md:flex-row">
      {/* Left pane — the archive */}
      <aside className="md:w-80 md:h-screen md:sticky md:top-0 bg-ink text-bone p-6 flex flex-col gap-6 md:overflow-y-auto">
        <div className="flex items-center gap-2.5">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            className="text-clay shrink-0"
            aria-hidden="true"
          >
            <path
              d="M4 4.5C4 3.67 4.67 3 5.5 3H15l5 5v12.5c0 .83-.67 1.5-1.5 1.5h-14C3.67 22 3 21.33 3 20.5v-16Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path d="M15 3v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M7.5 12.5h9M7.5 16h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <h1 className="font-serif text-2xl">Archive</h1>
        </div>
        <p className="text-sm text-bone/70 -mt-4">
          Upload a document, ask it questions, trace every answer back to its source.
        </p>

        <div>
          <span className="block text-xs font-mono uppercase tracking-wide opacity-60 mb-2">
            Add a document
          </span>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              if (!uploading) setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-lg px-4 py-6 text-center transition-colors focus-within:ring-2 focus-within:ring-clay focus-within:ring-offset-2 focus-within:ring-offset-ink ${
              dragActive ? "border-clay bg-clay/10" : "border-bone/25 hover:border-bone/40"
            } ${uploading ? "opacity-60" : ""}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileInputChange}
              disabled={uploading}
              aria-label="Upload a PDF document"
              className="absolute inset-0 h-full w-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <div className="pointer-events-none flex flex-col items-center gap-1.5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="opacity-70">
                <path
                  d="M12 16V4m0 0 4 4m-4-4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-sm font-serif">
                {uploading ? "Reading and embedding…" : "Drop a PDF here, or click to browse"}
              </p>
            </div>
          </div>
          <p className="text-xs font-mono opacity-50 mt-1.5">Maximum file size: {MAX_FILE_SIZE_MB}MB</p>
        </div>

        <div className="text-sm min-h-[1.25rem]" aria-live="polite">
          {uploadError && <p className="text-clay-light">{uploadError}</p>}
          {deleteError && <p className="text-clay-light">Couldn't delete {deleteError}</p>}
        </div>

        <div className="flex-1 overflow-y-auto -mr-2 pr-2">
          <span className="block text-xs font-mono uppercase tracking-wide opacity-60 mb-2">
            Documents ({documents.length})
          </span>
          {documentsLoading ? (
            <p className="text-sm opacity-50">Loading…</p>
          ) : documents.length === 0 ? (
            <p className="text-sm opacity-50">Nothing uploaded yet.</p>
          ) : (
            <ul className="space-y-1">
              {documents.map((doc, i) => {
                const isConfirming = confirmDeleteId === doc.id;
                const isDeleting = deletingId === doc.id;
                const isSummarizing = summary?.documentId === doc.id && summary?.loading;
                return (
                  <li
                    key={doc.id ?? i}
                    className="group rounded-lg px-2 -mx-2 py-2.5 border-b border-bone/10 last:border-b-0 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="mt-1 shrink-0 opacity-50"
                        aria-hidden="true"
                      >
                        <path
                          d="M6 2.5h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-17a1 1 0 0 1 1-1Z"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinejoin="round"
                        />
                        <path d="M14 2.5v4h4" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                      </svg>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="font-serif truncate min-w-0" title={doc.filename}>
                            {doc.filename}
                          </div>
                          {doc.hasFile && (
                            <a
                              href={`/api/documents/${doc.id}/file`}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Preview ${doc.filename} in a new tab`}
                              title="Preview original PDF"
                              className="shrink-0 text-bone/50 hover:text-clay transition-colors focus-ring rounded p-0.5"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path
                                  d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinejoin="round"
                                />
                                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                              </svg>
                            </a>
                          )}
                        </div>
                        <div className="text-xs opacity-50 font-mono mt-0.5">{doc.chunkCount} chunks</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 mt-2">
                      <button
                        onClick={() => handleSummarize(doc)}
                        disabled={isSummarizing || isDeleting}
                        className="text-xs font-mono uppercase tracking-wide border border-bone/25 text-bone/70 rounded px-2 py-1 hover:border-clay hover:text-clay transition-colors disabled:opacity-40 focus-ring"
                      >
                        {isSummarizing ? "…" : "Summarize"}
                      </button>

                      <button
                        onClick={() => handleDeleteClick(doc)}
                        disabled={isDeleting}
                        aria-label={isConfirming ? `Confirm delete ${doc.filename}` : `Delete ${doc.filename}`}
                        title={isConfirming ? "Click again to confirm" : "Delete document"}
                        className={`text-xs font-mono uppercase tracking-wide rounded px-2 py-1 transition-colors disabled:opacity-40 focus-ring border ${
                          isConfirming
                            ? "border-clay bg-clay text-bone"
                            : "border-bone/25 text-bone/70 hover:border-clay hover:text-clay"
                        }`}
                      >
                        {isDeleting ? "…" : isConfirming ? "Confirm?" : "Delete"}
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
          className="fixed inset-0 bg-body/60 flex items-center justify-center p-4 z-50"
          onClick={() => setSummary(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="summary-heading"
        >
          <div
            className="bg-paper text-body rounded-2xl shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 px-8 pt-6 pb-4 shrink-0">
              <div className="min-w-0">
                <div className="text-xs font-mono uppercase tracking-wide text-slate opacity-60 mb-1">
                  Summary
                </div>
                <h2 id="summary-heading" className="font-serif text-xl truncate">
                  {summary.filename}
                </h2>
              </div>
              <button
                onClick={() => setSummary(null)}
                className="font-mono text-sm text-slate hover:text-clay shrink-0 focus-ring rounded p-1"
                aria-label="Close summary"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto px-8 pb-8" aria-live="polite">
              {summary.loading && (
                <p className="font-mono text-sm text-slate opacity-70">Reading the whole document…</p>
              )}
              {summary.error && <p className="text-sm text-clay">{summary.error}</p>}
              {summary.text && (
                <p className="font-serif text-base leading-relaxed whitespace-pre-wrap">{summary.text}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Right pane — the Q&A thread */}
      <section className="flex-1 flex flex-col p-6 md:p-10 min-h-screen">
        <div className="flex-1 space-y-6 overflow-y-auto">
          {thread.length === 0 && (
            <p className="font-serif text-lg text-slate opacity-70">
              Ask a question about what you've uploaded. Answers cite the exact
              passage they came from — click a marker to see it.
            </p>
          )}

          {thread.map((entry, i) =>
            entry.role === "question" ? (
              <div key={i} className="flex justify-end">
                <div className="max-w-[85%] md:max-w-[70%]">
                  <div className="text-right text-xs font-mono uppercase tracking-wide text-slate opacity-60 mb-1 pr-1">
                    You
                  </div>
                  <div className="bg-ink text-bone rounded-2xl rounded-br-sm px-5 py-3 font-serif text-base md:text-lg leading-relaxed shadow-sm">
                    {entry.text}
                  </div>
                </div>
              </div>
            ) : (
              <div key={i} className="flex justify-start">
                <div className="max-w-[90%] md:max-w-[75%]">
                  <div className="text-xs font-mono uppercase tracking-wide text-slate opacity-60 mb-1 pl-1">
                    Archive
                  </div>
                  <div className="bg-paper text-body border border-slate/15 rounded-2xl rounded-bl-sm px-5 py-4 font-serif text-base leading-relaxed shadow-sm">
                    {renderAnswerWithCitations(entry.text, entry.sources || [], i)}

                    {entry.sources?.map((source) => {
                      const key = `${i}-${source.index}`;
                      if (openSource !== key) return null;
                      return (
                        <div
                          key={key}
                          className="mt-3 bg-bone/60 border-l-2 border-clay p-3 text-sm text-slate font-sans rounded"
                        >
                          <div className="font-mono text-xs mb-1 opacity-70">
                            [{source.index}] {source.filename}
                          </div>
                          {source.excerpt}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )
          )}

          {asking && (
            <div className="flex justify-start" aria-live="polite">
              <div className="bg-paper border border-slate/15 rounded-2xl rounded-bl-sm px-5 py-3 font-mono text-sm text-slate opacity-70 shadow-sm">
                Searching the archive…
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleAsk} className="mt-6 flex gap-2">
          <label htmlFor="question-input" className="sr-only">
            Ask a question about your documents
          </label>
          <input
            id="question-input"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about your documents…"
            className="flex-1 border border-slate/30 rounded px-4 py-3 font-serif bg-white/70 focus:outline-none focus:ring-2 focus:ring-clay"
          />
          <button
            type="submit"
            disabled={asking}
            className="bg-clay text-bone px-5 py-3 rounded font-serif disabled:opacity-50 hover:bg-clay-dark transition-colors focus-ring"
          >
            Ask
          </button>
        </form>
      </section>
    </main>
  );
}
