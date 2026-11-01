"use client";

import { useFormStatus } from "react-dom";
import { customerLogoutAction } from "@/app/account/actions";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/i18n/client";

function Submit() {
  const { t } = useI18n();
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" loading={pending} className="w-full sm:w-auto">
      {t.account.logout}
    </Button>
  );
}

export default function CustomerLogoutButton() {
  return (
    <form action={customerLogoutAction}>
      <Submit />
    </form>
  );
}
