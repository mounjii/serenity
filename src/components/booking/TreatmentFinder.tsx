"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckIcon, LotusIcon } from "@/components/Icons";
import { formatDuration } from "@/lib/format";
import { serviceImage } from "@/lib/images";
import { serviceDetails } from "@/lib/service-details";
import {
  GOAL_CHOICES,
  PRESSURE_CHOICES,
  TIME_CHOICES,
  rankTreatments,
  type FinderAnswers,
  type FinderMatch,
} from "@/lib/treatment-finder";
import type { PublicService } from "@/server/booking/services";

const STORAGE_KEY = "serenity-finder";

type Draft = Partial<FinderAnswers> & { pressureSet?: boolean };

function readDraft(): Draft {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Draft) : {};
  } catch {
    return {};
  }
}

function saveDraft(draft: Draft) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Private browsing can refuse storage; the quiz still works without it.
  }
}

function isComplete(draft: Draft): draft is FinderAnswers & { pressureSet: true } {
  return !!draft.goal && draft.pressureSet === true && typeof draft.minutes === "number";
}

type Props = {
  services: PublicService[];
  onPick: (match: FinderMatch) => void;
  onClose: () => void;
};

export default function TreatmentFinder({ services, onPick, onClose }: Props) {
  const [draft, setDraft] = useState<Draft>(readDraft);
  const [question, setQuestion] = useState<0 | 1 | 2 | 3>(() => (isComplete(readDraft()) ? 3 : 0));

  const update = (patch: Draft, next: 1 | 2 | 3) => {
    const value = { ...draft, ...patch };
    setDraft(value);
    saveDraft(value);
    setQuestion(next);
  };

  const restart = () => {
    setDraft({});
    saveDraft({});
    setQuestion(0);
  };

  const matches = isComplete(draft) ? rankTreatments(services, draft).slice(0, 3) : [];

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={question === 0 || question === 3 ? onClose : () => setQuestion((q) => (q - 1) as 0 | 1 | 2)}
          className="inline-flex items-center gap-2 text-[0.72rem] tracking-[0.2em] text-muted uppercase transition hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> {question === 0 || question === 3 ? "All treatments" : "Back"}
        </button>
        {question < 3 && (
          <span className="flex items-center gap-1.5" aria-label={`Question ${question + 1} of 3`}>
            {[0, 1, 2].map((i) => (
              <span key={i} className={`h-1 rounded-full transition-all duration-500 ${i <= question ? "w-8 bg-ink" : "w-4 bg-sand"}`} />
            ))}
          </span>
        )}
      </div>

      <div key={question} className="animate-step-next mt-6">
        {question === 0 && (
          <Question eyebrow="Question 1 of 3" title="What would you like help with?">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {GOAL_CHOICES.map((c, i) => (
                <Choice key={c.value} index={i} selected={draft.goal === c.value} label={c.label} hint={c.hint} onClick={() => update({ goal: c.value }, 1)} />
              ))}
            </div>
          </Question>
        )}

        {question === 1 && (
          <Question eyebrow="Question 2 of 3" title="What pressure do you enjoy?">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {PRESSURE_CHOICES.map((c, i) => (
                <Choice
                  key={c.label}
                  index={i}
                  selected={draft.pressureSet === true && draft.pressure === c.value}
                  label={c.label}
                  hint={c.hint}
                  meter={c.value ?? undefined}
                  onClick={() => update({ pressure: c.value, pressureSet: true }, 2)}
                />
              ))}
            </div>
          </Question>
        )}

        {question === 2 && (
          <Question eyebrow="Question 3 of 3" title="How much time do you have?">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {TIME_CHOICES.map((c, i) => (
                <Choice key={c.value} index={i} selected={draft.minutes === c.value} label={c.label} onClick={() => update({ minutes: c.value }, 3)} />
              ))}
            </div>
          </Question>
        )}

        {question === 3 && matches.length > 0 && (
          <Results services={services} matches={matches} onPick={onPick} onRestart={restart} />
        )}
      </div>
    </div>
  );
}

function Question({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[0.66rem] tracking-[0.3em] text-muted uppercase">{eyebrow}</p>
      <h2 className="mt-1.5 font-serif text-2xl text-ink sm:text-[2rem]">{title}</h2>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Choice({
  index,
  selected,
  label,
  hint,
  meter,
  onClick,
}: {
  index: number;
  selected: boolean;
  label: string;
  hint?: string;
  meter?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      style={{ animationDelay: `${60 + index * 50}ms` }}
      className={`animate-fade-up group flex min-h-[5.5rem] flex-col justify-center rounded-xl border px-5 py-4 text-left transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-22px_rgba(60,40,20,0.6)] ${
        selected ? "border-ink bg-ink text-cream" : "border-sand bg-white text-ink hover:border-ink"
      }`}
    >
      <span className="flex items-center justify-between gap-3">
        <span className="font-serif text-[1.2rem] leading-tight">{label}</span>
        {selected ? <CheckIcon className="h-4 w-4 shrink-0" /> : <ArrowRight className="h-4 w-4 shrink-0 opacity-0 transition group-hover:opacity-60" />}
      </span>
      {meter !== undefined && (
        <span className="mt-2 flex gap-1" aria-hidden>
          {[1, 2, 3, 4, 5].map((level) => (
            <span key={level} className={`h-1.5 w-4 rounded-full ${level <= meter ? (selected ? "bg-cream" : "bg-ink") : selected ? "bg-cream/25" : "bg-sand"}`} />
          ))}
        </span>
      )}
      {hint && <span className={`mt-1.5 text-[0.76rem] font-light ${selected ? "text-cream/75" : "text-muted"}`}>{hint}</span>}
    </button>
  );
}

function Results({
  services,
  matches,
  onPick,
  onRestart,
}: {
  services: PublicService[];
  matches: FinderMatch[];
  onPick: (match: FinderMatch) => void;
  onRestart: () => void;
}) {
  const [best, ...others] = matches;
  const byId = (id: string) => services.find((s) => s.id === id);
  const bestService = byId(best.serviceId);
  if (!bestService) return null;
  const bestInfo = serviceDetails(bestService.slug, bestService.description);

  return (
    <div>
      <p className="text-[0.66rem] tracking-[0.3em] text-muted uppercase">Your match</p>
      <h2 className="mt-1.5 font-serif text-2xl text-ink sm:text-[2rem]">We recommend</h2>

      <article className="animate-fade-up mt-6 grid overflow-hidden rounded-2xl border border-sand bg-white md:grid-cols-[0.9fr_1.4fr]">
        <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[17rem]">
          <Image src={serviceImage(bestService.slug)} alt={bestService.name} fill sizes="(min-width: 768px) 35vw, 100vw" className="object-cover" />
          <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[0.65rem] tracking-[0.18em] text-cream uppercase">
            <LotusIcon className="h-3.5 w-3.5" aria-hidden /> Best for you
          </span>
        </div>
        <div className="flex flex-col p-5 sm:p-7">
          <h3 className="font-serif text-[1.9rem] leading-tight text-ink">{bestService.name}</h3>
          <p className="mt-2 text-[0.88rem] leading-relaxed font-light text-ink-soft">{bestInfo.summary}</p>
          {best.reasons.length > 0 && (
            <ul className="mt-4 space-y-1.5 text-[0.84rem] text-ink-soft">
              {best.reasons.map((r) => (
                <li key={r} className="flex items-start gap-2.5">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-ink" aria-hidden />
                  {r}
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={() => onPick(best)}
            className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-full bg-ink py-3.5 text-[0.85rem] tracking-wide text-cream transition hover:-translate-y-0.5 hover:bg-black sm:w-auto sm:self-start sm:px-8"
          >
            See details · {formatDuration(best.durationMinutes)}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </article>

      {others.length > 0 && (
        <>
          <p className="mt-8 text-[0.66rem] tracking-[0.3em] text-muted uppercase">Also a good fit</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {others.map((m, i) => {
              const s = byId(m.serviceId);
              if (!s) return null;
              return (
                <button
                  key={m.serviceId}
                  type="button"
                  onClick={() => onPick(m)}
                  style={{ animationDelay: `${150 + i * 80}ms` }}
                  className="animate-fade-up group flex items-center gap-4 rounded-xl border border-sand bg-white p-3 text-left transition hover:-translate-y-0.5 hover:border-ink"
                >
                  <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                    <Image src={serviceImage(s.slug)} alt="" fill sizes="64px" className="object-cover" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-serif text-[1.15rem] leading-tight text-ink">{s.name}</span>
                    <span className="mt-0.5 block truncate text-[0.76rem] font-light text-muted">{serviceDetails(s.slug, s.description).summary}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-ink-soft transition group-hover:translate-x-0.5" />
                </button>
              );
            })}
          </div>
        </>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-sand pt-4">
        <p className="text-[0.74rem] text-muted">
          Pregnant, injured or have a medical condition? Mention it in the note at the next step.
        </p>
        <button type="button" onClick={onRestart} className="text-[0.72rem] tracking-[0.2em] text-ink uppercase underline-offset-4 hover:underline">
          Start again
        </button>
      </div>
    </div>
  );
}
