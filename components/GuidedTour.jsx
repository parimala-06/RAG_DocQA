"use client";

import { useEffect, useLayoutEffect, useState, useCallback } from "react";

const STORAGE_KEY = "archive-tour-seen";

const STEPS = [
  {
    title: "Start with a document",
    body: "Drop a PDF here, or click to browse. It's read, chunked, and embedded so it can be searched.",
    placement: "bottom",
  },
  {
    title: "Then ask about it",
    body: "Ask a question here. The answer cites the exact passage it came from — tap the marker to check it.",
    placement: "top",
  },
];

function measure(el) {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

export function useTourVisibility() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    let seen = true;
    try {
      seen = window.localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      // localStorage unavailable (private mode, etc.) — default to showing once per session.
    }
    if (!seen) setActive(true);
  }, []);

  const dismiss = useCallback(() => {
    setActive(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Non-fatal — the tour will just offer itself again next visit.
    }
  }, []);

  const replay = useCallback(() => setActive(true), []);

  return { active, dismiss, replay };
}

export default function GuidedTour({ active, onDismiss, targets }) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState(null);

  useEffect(() => {
    if (active) setStep(0);
  }, [active]);

  useLayoutEffect(() => {
    if (!active) return;
    const el = targets[step]?.current;

    function update() {
      setRect(measure(el));
    }
    update();

    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [active, step, targets]);

  useEffect(() => {
    if (!active) return;
    function onKeyDown(e) {
      if (e.key === "Escape") onDismiss();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, onDismiss]);

  if (!active || !rect) return null;

  const info = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const padding = 6;
  const spotlightStyle = {
    top: rect.top - padding,
    left: rect.left - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  };

  const margin = 12;
  const calloutWidth = 320;
  const spaceBelow = window.innerHeight - (rect.top + rect.height);
  const placeBelow = info.placement === "bottom" && spaceBelow > 160;
  const calloutStyle = placeBelow
    ? { top: rect.top + rect.height + padding + margin, left: Math.max(margin, Math.min(rect.left, window.innerWidth - calloutWidth - margin)) }
    : { top: Math.max(margin, rect.top - padding - margin - 140), left: Math.max(margin, Math.min(rect.left, window.innerWidth - calloutWidth - margin)) };

  return (
    <div className="tour-scrim" role="presentation">
      <div className="tour-spotlight" style={spotlightStyle} aria-hidden="true" />
      <div
        className="tour-callout bg-paper rounded-2xl shadow-card p-7 flex flex-col gap-3"
        style={calloutStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-step-heading"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wide text-coral-deep tabular">
            {step + 1} of {STEPS.length}
          </span>
          <button
            onClick={onDismiss}
            className="text-muted hover:text-ink focus-ring rounded-full p-1 -m-1 transition-colors"
            aria-label="Skip guide"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <h2 id="tour-step-heading" className="font-display text-lg font-extrabold text-ink">
          {info.title}
        </h2>
        <p className="text-sm text-muted leading-relaxed">{info.body}</p>
        <div className="flex justify-end">
          <button
            onClick={() => (isLast ? onDismiss() : setStep((s) => s + 1))}
            className="flex items-center gap-1 bg-night text-mist rounded-full px-4 py-2 text-sm font-bold hover:bg-teal hover:text-night transition-colors focus-ring shrink-0 disabled:bg-night-elevated disabled:text-muted-dark disabled:pointer-events-none"
          >
            {isLast ? "Got it" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
