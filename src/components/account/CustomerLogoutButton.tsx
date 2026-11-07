"use client";

import { useFormStatus } from "react-dom";
import { customerLogoutAction } from "@/app/account/actions";
import { LogoutIcon } from "@/components/Icons";
import { useI18n } from "@/i18n/client";

function Submit() {
  const { t } = useI18n();
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center gap-3 rounded-full px-3.5 py-2.5 text-[0.84rem] font-medium text-sage transition hover:bg-forest/5 hover:text-ink disabled:opacity-60"
    >
      <LogoutIcon className="h-[1.15rem] w-[1.15rem]" />
      {t.account.logout}
    </button>
  );
}

export default function CustomerLogoutButton() {
  return (
    <form action={customerLogoutAction}>
      <Submit />
    </form>
  );
}
