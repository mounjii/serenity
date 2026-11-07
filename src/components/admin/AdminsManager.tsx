"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createStaffAdminAction, removeStaffAdminAction, updateStaffAccessAction, type ProfileState } from "@/app/admin/actions";
import { ADMIN_AREAS, type AdminArea } from "@/lib/admin-areas";
import { Button } from "@/components/ui/Button";
import PasswordField from "./PasswordField";
import type { StaffAdmin } from "@/server/admin/profile";

const initialState: ProfileState = { error: null, saved: false };
const inputClass =
  "block w-full rounded-sm border border-sand bg-white px-4 py-3 text-[0.95rem] text-ink outline-none transition focus:border-forest";

function AreaPicker({ selected }: { selected?: readonly AdminArea[] }) {
  return (
    <fieldset>
      <legend className="mb-2 block text-[0.8rem] text-ink">What they can open</legend>
      <div className="flex flex-wrap gap-2">
        {ADMIN_AREAS.map((area) => (
          <label
            key={area.key}
            className="flex cursor-pointer items-center gap-2 rounded-full border border-sand bg-ivory px-3 py-1.5 text-[0.8rem] text-ink has-checked:border-forest has-checked:bg-forest/10"
          >
            <input
              type="checkbox"
              name="areas"
              value={area.key}
              defaultChecked={selected?.includes(area.key)}
              className="accent-forest"
            />
            {area.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function StaffRow({ admin }: { admin: StaffAdmin }) {
  const [state, formAction, pending] = useActionState(updateStaffAccessAction, initialState);
  const accessId = `staff-access-${admin.id}`;
  const removeId = `staff-remove-${admin.id}`;

  return (
    <tr className="transition-colors hover:bg-cream/50">
      <td className="px-4 py-3">
        <form id={accessId} action={formAction} />
        <form id={removeId} action={removeStaffAdminAction}>
          <input type="hidden" name="id" value={admin.id} />
        </form>
        <input type="hidden" name="id" value={admin.id} form={accessId} />
        <span className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-forest text-[0.8rem] font-medium text-white uppercase">
            {admin.username.charAt(0)}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-medium text-ink">{admin.username}</span>
            {state.saved ? <span className="block text-[0.72rem] text-forest">Saved</span> : null}
            {state.fieldErrors?.areas ? <span className="block text-[0.72rem] text-red-700">{state.fieldErrors.areas}</span> : null}
            {state.error && !state.fieldErrors?.areas ? <span className="block text-[0.72rem] text-red-700">{state.error}</span> : null}
          </span>
        </span>
      </td>
      {ADMIN_AREAS.map((area) => (
        <td key={area.key} className="px-2 py-3 text-center">
          <input
            type="checkbox"
            name="areas"
            value={area.key}
            form={accessId}
            defaultChecked={admin.areas.includes(area.key)}
            aria-label={`${admin.username} ${area.label}`}
            className="h-4 w-4 accent-forest"
          />
        </td>
      ))}
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          <Button type="submit" form={accessId} size="sm" loading={pending}>
            Save
          </Button>
          <Button type="submit" form={removeId} variant="danger" size="sm">
            Remove
          </Button>
        </div>
      </td>
    </tr>
  );
}

export default function AdminsManager({ staff }: { staff: StaffAdmin[] }) {
  const [state, formAction, pending] = useActionState(createStaffAdminAction, initialState);
  const [query, setQuery] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const needle = query.trim().toLowerCase();
  const visible = needle ? staff.filter((admin) => admin.username.toLowerCase().includes(needle)) : staff;

  useEffect(() => {
    if (!state.saved) return;
    formRef.current?.reset();
  }, [state.saved]);

  return (
    <div className="space-y-5">
      <section className="mx-auto max-w-3xl rounded-2xl border border-sand bg-white p-5 sm:p-6">
        <h2 className="text-[1.05rem] font-semibold tracking-[-0.02em] text-ink">Add an admin</h2>
        <p className="mt-1 text-[0.85rem] text-sage">Tick only the parts of the dashboard they should use. Members & offers stays on your account.</p>
        <form ref={formRef} action={formAction} className="mt-5 space-y-4">
          <div>
            <label htmlFor="staff-username" className="mb-1.5 block text-[0.8rem]">
              Name
            </label>
            <input
              id="staff-username"
              name="username"
              required
              autoComplete="off"
              aria-invalid={state.fieldErrors?.username ? true : undefined}
              className={`${inputClass} ${state.fieldErrors?.username ? "border-red-300" : ""}`}
            />
            {state.fieldErrors?.username ? <p className="mt-1.5 text-[0.78rem] text-red-700">{state.fieldErrors.username}</p> : null}
          </div>
          <PasswordField
            id="staff-password"
            name="password"
            label="Password"
            autoComplete="new-password"
            required
            error={state.fieldErrors?.password}
          />
          <PasswordField
            id="staff-confirm"
            name="confirmPassword"
            label="Confirm password"
            autoComplete="new-password"
            required
            error={state.fieldErrors?.confirmPassword}
          />
          <p className="text-[0.78rem] text-sage">At least 10 characters.</p>
          <AreaPicker />
          {state.fieldErrors?.areas ? <p className="text-[0.78rem] text-red-700">{state.fieldErrors.areas}</p> : null}
          {state.saved ? <p className="text-[0.85rem] text-forest">Admin added. They can sign in now.</p> : null}
          {state.error ? <p className="text-[0.85rem] text-red-700">{state.error}</p> : null}
          <Button type="submit" loading={pending}>
            Add admin
          </Button>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl border border-sand bg-white">
        {staff.length === 0 ? (
          <p className="px-5 py-8 text-center text-[0.85rem] text-sage">No other admin yet.</p>
        ) : (
          <>
            <div className="border-b border-sand/70 px-4 py-3">
              <label htmlFor="admin-search" className="sr-only">
                Search admins
              </label>
              <input
                id="admin-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name"
                autoComplete="off"
                className="block w-full max-w-sm rounded-full border border-sand bg-ivory px-4 py-2.5 text-[0.85rem] text-ink outline-none transition placeholder:text-sage focus:border-forest"
              />
            </div>
            {visible.length === 0 ? (
              <p className="px-5 py-8 text-center text-[0.85rem] text-sage">No admin matches that name.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-208 text-left text-[0.85rem]">
                  <thead>
                    <tr className="text-[0.72rem] text-muted">
                      <th className="bg-cream/70 px-4 py-2.5 font-normal">Admin</th>
                      {ADMIN_AREAS.map((area) => (
                        <th key={area.key} className="bg-cream/70 px-2 py-2.5 text-center font-normal whitespace-nowrap">
                          {area.label}
                        </th>
                      ))}
                      <th className="bg-cream/70 px-4 py-2.5 text-right font-normal"> </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand/50">
                    {visible.map((admin) => (
                      <StaffRow key={admin.id} admin={admin} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
