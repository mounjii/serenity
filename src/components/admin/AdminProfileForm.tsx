"use client";

import { useActionState, useEffect, useRef } from "react";
import { saveAdminAvatarAction, updateAdminProfileAction, type ProfileState } from "@/app/admin/actions";
import ProfilePhotoForm from "@/components/account/ProfilePhotoForm";
import { Button } from "@/components/ui/Button";
import PasswordField from "./PasswordField";

const initialState: ProfileState = { error: null, saved: false };
const inputClass =
  "block w-full rounded-sm border border-sand bg-white px-4 py-3 text-[0.95rem] text-ink outline-none transition focus:border-forest";

export default function AdminProfileForm({ username, avatarUrl }: { username: string; avatarUrl: string | null }) {
  const [state, formAction, pending] = useActionState(updateAdminProfileAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.saved || !formRef.current) return;
    for (const name of ["currentPassword", "newPassword", "confirmPassword"]) {
      const input = formRef.current.elements.namedItem(name);
      if (input instanceof HTMLInputElement) input.value = "";
    }
  }, [state.saved]);

  return (
    <div className="space-y-5">
    <section className="rounded-2xl border border-sand bg-white p-5 sm:p-6">
      <ProfilePhotoForm
        src={avatarUrl}
        initials={username}
        title="Profile photo"
        hint="JPG, PNG or WebP. Up to 2 MB."
        changeLabel="Choose a photo"
        saveLabel="Save photo"
        removeLabel="Remove photo"
        savedLabel="Photo saved."
        action={saveAdminAvatarAction}
      />
    </section>
    <form ref={formRef} action={formAction} className="space-y-8 rounded-2xl border border-sand bg-white p-5 sm:p-6">
      <fieldset className="space-y-5">
        <legend className="text-[1.05rem] font-semibold tracking-[-0.02em] text-ink">Name</legend>
        <p className="text-[0.85rem] text-ink-soft">This is shown in the dashboard and used to sign in.</p>
        <div>
          <label htmlFor="username" className="mb-1.5 block text-[0.8rem]">
            Name
          </label>
          <input
            id="username"
            name="username"
            defaultValue={username}
            autoComplete="username"
            required
            maxLength={40}
            aria-invalid={state.fieldErrors?.username ? true : undefined}
            className={`${inputClass} ${state.fieldErrors?.username ? "border-red-300" : ""}`}
          />
          {state.fieldErrors?.username && <p className="mt-1.5 text-[0.78rem] text-red-700">{state.fieldErrors.username}</p>}
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-[1.05rem] font-semibold tracking-[-0.02em] text-ink">Password</legend>
        <p className="text-[0.85rem] text-ink-soft">Leave the new password blank if you only want to change the name.</p>
        <PasswordField
          id="currentPassword"
          name="currentPassword"
          label="Current password"
          autoComplete="current-password"
          required
          error={state.fieldErrors?.currentPassword}
        />
        <PasswordField
          id="newPassword"
          name="newPassword"
          label="New password (min. 10 characters)"
          autoComplete="new-password"
          error={state.fieldErrors?.newPassword}
        />
        <PasswordField
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm new password"
          autoComplete="new-password"
          error={state.fieldErrors?.confirmPassword}
        />
      </fieldset>

      {state.saved && (
        <p role="status" className="rounded-lg border border-olive/30 bg-olive/10 px-4 py-3 text-[0.85rem] text-olive-dark">
          Profile saved.
        </p>
      )}
      {state.error && !state.fieldErrors && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[0.85rem] text-red-700">
          {state.error}
        </p>
      )}

      <Button type="submit" loading={pending}>
        Save changes
      </Button>
    </form>
    </div>
  );
}
