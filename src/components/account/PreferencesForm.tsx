"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useActionState, useEffect, useState } from "react";
import { savePreferencesAction, type CustomerAuthState } from "@/app/account/actions";
import {
  CheckIcon,
  FacebookIcon,
  FeetIcon,
  GoogleIcon,
  InstagramIcon,
  LotusIcon,
  NeckIcon,
  PinIcon,
  RunnerIcon,
  StretchIcon,
  UserIcon,
} from "@/components/Icons";
import { useI18n } from "@/i18n/client";
import { fmt } from "@/i18n/format";
import { DISCOVERY_SOURCES, VISIT_FREQUENCIES, WELLNESS_GOALS, type DiscoverySource } from "@/lib/customer-preferences";
import type { Goal } from "@/lib/service-details";

const initialState: CustomerAuthState = { error: null };
const fields = ["preferredMassage", "wellnessGoal", "visitFrequency", "discovery"] as const;
type Field = (typeof fields)[number];

const goalIcons: Record<Goal, typeof LotusIcon> = {
  relax: LotusIcon,
  pain: StretchIcon,
  neck: NeckIcon,
  sport: RunnerIcon,
  feet: FeetIcon,
  flexibility: StretchIcon,
};

const discoveryIcons: Record<DiscoverySource, typeof GoogleIcon> = {
  google: GoogleIcon,
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  friend: UserIcon,
  passing: PinIcon,
};

export default function PreferencesForm({
  next,
  massages,
}: {
  next: string;
  massages: { slug: string; name: string; image: string }[];
}) {
  const { t } = useI18n();
  const [state, action, pending] = useActionState(savePreferencesAction, initialState);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<Field, string>>({
    preferredMassage: "",
    wellnessGoal: "",
    visitFrequency: "",
    discovery: "",
  });
  const [missing, setMissing] = useState(false);
  const field = fields[step] ?? "preferredMassage";
  const titles = [t.account.qMassage, t.account.qGoal, t.account.qFrequency, t.account.qDiscovery];
  const serverError = state.fieldErrors?.[field];

  useEffect(() => {
    const failed = fields.findIndex((name) => state.fieldErrors?.[name]);
    if (failed >= 0) setStep(failed);
  }, [state]);

  function choose(name: Field, value: string) {
    setAnswers((current) => ({ ...current, [name]: value }));
    setMissing(false);
    const index = fields.indexOf(name);
    if (index >= 0 && index < fields.length - 1) setStep(index + 1);
  }

  function forward() {
    if (!answers[field]) {
      setMissing(true);
      return;
    }
    setMissing(false);
    setStep((current) => Math.min(current + 1, fields.length - 1));
  }

  return (
    <form action={action} className="mt-6">
      <input type="hidden" name="next" value={next} />
      {fields.map((name) => (
        <input key={name} type="hidden" name={name} value={answers[name]} />
      ))}

      <p className="text-[0.72rem] font-medium tracking-[0.16em] text-sage uppercase">
        {fmt(t.account.stepOf, { n: step + 1, total: fields.length })}
      </p>
      <div className="mt-2 flex gap-1.5" aria-hidden="true">
        {fields.map((name, index) => (
          <span key={name} className={`h-1 flex-1 rounded-full ${index <= step ? "bg-forest" : "bg-black/10"}`} />
        ))}
      </div>

      <div className="mt-4">
      {step === 0 && (
      <Question index={1} title={titles[0] ?? ""} error={serverError ?? (missing ? t.account.chooseOne : undefined)}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {massages.map((massage) => (
            <label key={massage.slug} className="cursor-pointer">
              <input type="radio" name="preferredMassage-choice" value={massage.slug} checked={answers.preferredMassage === massage.slug} onChange={() => choose("preferredMassage", massage.slug)} className="peer sr-only" />
              <span className="relative block overflow-hidden rounded-2xl border border-sand bg-ivory transition peer-checked:border-forest peer-checked:ring-2 peer-checked:ring-forest peer-checked:[&_.tick]:flex peer-focus-visible:ring-2 peer-focus-visible:ring-forest/30">
                <span className="tick absolute end-2 top-2 z-10 hidden h-6 w-6 items-center justify-center rounded-full bg-forest text-white">
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                <span className="relative block aspect-[4/3]">
                  <Image src={massage.image} alt="" fill sizes="(min-width: 640px) 180px, 45vw" className="object-cover" />
                </span>
                <span className="block px-3 py-2.5 text-[0.82rem] leading-snug font-medium text-ink">{massage.name}</span>
              </span>
            </label>
          ))}
        </div>
      </Question>
      )}
      {step === 1 && (
      <Question index={2} title={titles[1] ?? ""} error={serverError ?? (missing ? t.account.chooseOne : undefined)}>
        <div className="grid gap-2 sm:grid-cols-2">
          {WELLNESS_GOALS.map((value) => {
            const Icon = goalIcons[value];
            return (
              <TextChoice key={value} name="wellnessGoal" value={value} checked={answers.wellnessGoal === value} onChoose={choose}>
                <span className="flex items-center gap-2 font-medium">
                  <Icon className="h-4 w-4 shrink-0" />
                  {t.finder.goals[value].label}
                </span>
                <span className="hint mt-1 block text-[0.75rem] leading-snug text-sage">{t.finder.goals[value].hint}</span>
              </TextChoice>
            );
          })}
        </div>
      </Question>
      )}
      {step === 2 && (
      <Question index={3} title={titles[2] ?? ""} error={serverError ?? (missing ? t.account.chooseOne : undefined)}>
        <div className="grid gap-2 sm:grid-cols-2">
          {VISIT_FREQUENCIES.map((value) => (
            <TextChoice key={value} name="visitFrequency" value={value} checked={answers.visitFrequency === value} onChoose={choose}>
              <span className="font-medium">{t.account.frequencies[value]}</span>
            </TextChoice>
          ))}
        </div>
      </Question>
      )}
      {step === 3 && (
      <Question index={4} title={titles[3] ?? ""} error={serverError ?? (missing ? t.account.chooseOne : undefined)}>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {DISCOVERY_SOURCES.map((value) => {
            const Icon = discoveryIcons[value];
            return (
              <TextChoice key={value} name="discovery" value={value} checked={answers.discovery === value} onChoose={choose}>
                <span className="flex items-center gap-2 font-medium">
                  <Icon className="h-4 w-4 shrink-0" />
                  {t.account.discoveries[value]}
                </span>
              </TextChoice>
            );
          })}
        </div>
      </Question>
      )}
      </div>

      {state.error && !state.fieldErrors && (
        <p role="alert" className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[0.85rem] text-red-700">
          {state.error}
        </p>
      )}

      <div className="mt-4 flex gap-2">
        {step > 0 && (
          <button
            type="button"
            onClick={() => {
              setMissing(false);
              setStep((current) => current - 1);
            }}
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-sand bg-white px-5 text-[0.9rem] font-medium text-ink transition hover:border-forest/30"
          >
            {t.booking.back}
          </button>
        )}
        {step < fields.length - 1 ? (
          <button
            type="button"
            onClick={forward}
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-forest px-8 text-[0.9rem] font-medium text-white transition hover:bg-forest-dark sm:flex-none"
          >
            {t.account.continue}
          </button>
        ) : (
          <button
            type="submit"
            disabled={pending}
            onClick={(event) => {
              if (!answers.discovery) {
                event.preventDefault();
                setMissing(true);
              }
            }}
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-forest px-8 text-[0.9rem] font-medium text-white transition hover:bg-forest-dark disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
          >
            {pending && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />}
            {t.account.continue}
          </button>
        )}
      </div>
    </form>
  );
}

function Question({ index, title, error, children }: { index: number; title: string; error?: string; children: ReactNode }) {
  return (
    <fieldset className="rounded-2xl border border-sand bg-white p-4 sm:p-5 [&>legend]:max-w-none [&>legend]:px-0">
      <legend className="w-full">
        <span className="block text-[0.68rem] font-medium tracking-[0.18em] text-sage">{String(index).padStart(2, "0")}</span>
        <span className="mt-1 block text-[1.02rem] font-semibold tracking-[-0.02em] text-ink">{title}</span>
      </legend>
      <div className="mt-4">{children}</div>
      {error && <p className="mt-2 text-[0.78rem] text-red-700">{error}</p>}
    </fieldset>
  );
}

function TextChoice({
  name,
  value,
  checked,
  onChoose,
  children,
}: {
  name: Field;
  value: string;
  checked: boolean;
  onChoose: (name: Field, value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="cursor-pointer">
      <input type="radio" name={`${name}-choice`} value={value} checked={checked} onChange={() => onChoose(name, value)} className="peer sr-only" />
      <span className="block rounded-2xl border border-sand bg-ivory px-3.5 py-3 text-[0.86rem] text-ink transition peer-checked:border-forest peer-checked:bg-forest peer-checked:text-white peer-checked:[&_.hint]:text-white/70 peer-focus-visible:ring-2 peer-focus-visible:ring-forest/30">
        {children}
      </span>
    </label>
  );
}
