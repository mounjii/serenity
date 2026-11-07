"use client";

import { useActionState, useEffect, useState } from "react";

type PhotoState = { error: string | null; saved?: boolean };

const initial: PhotoState = { error: null };

export default function ProfilePhotoForm({
  src,
  initials,
  title,
  hint,
  changeLabel,
  saveLabel,
  removeLabel,
  savedLabel,
  action,
}: {
  src: string | null;
  initials: string;
  title: string;
  hint: string;
  changeLabel: string;
  saveLabel: string;
  removeLabel: string;
  savedLabel: string;
  action: (state: PhotoState, formData: FormData) => Promise<PhotoState>;
}) {
  const [state, formAction, pending] = useActionState(action, initial);
  const [preview, setPreview] = useState<string | null>(null);
  const shown = preview ?? src;

  useEffect(() => {
    setPreview(null);
  }, [src]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <form action={formAction} className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <span className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full bg-forest text-[1.4rem] font-semibold text-white uppercase">
        {shown ? <img src={shown} alt="" className="h-full w-full object-cover" /> : initials.slice(0, 1)}
      </span>
      <div className="min-w-0">
        <p className="text-[0.95rem] font-medium text-ink">{title}</p>
        <p className="mt-1 text-[0.8rem] text-sage">{hint}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label className="inline-flex min-h-10 cursor-pointer items-center rounded-full border border-sand px-4 text-[0.82rem] font-medium text-ink transition hover:border-forest/30">
            {changeLabel}
            <input
              type="file"
              name="avatar"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                setPreview(file ? URL.createObjectURL(file) : null);
              }}
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-10 items-center rounded-full bg-forest px-4 text-[0.82rem] font-medium text-white transition hover:bg-forest-dark disabled:opacity-60"
          >
            {saveLabel}
          </button>
          {src ? (
            <button
              type="submit"
              name="remove"
              value="1"
              disabled={pending}
              className="inline-flex min-h-10 items-center rounded-full px-3 text-[0.82rem] font-medium text-sage transition hover:text-ink disabled:opacity-60"
            >
              {removeLabel}
            </button>
          ) : null}
        </div>
        {state.saved ? <p className="mt-2 text-[0.8rem] text-forest">{savedLabel}</p> : null}
        {state.error ? <p className="mt-2 text-[0.8rem] text-red-700">{state.error}</p> : null}
      </div>
    </form>
  );
}
