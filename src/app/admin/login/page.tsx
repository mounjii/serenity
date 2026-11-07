import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import LoginForm from "@/components/admin/LoginForm";
import { getI18n } from "@/i18n/server";

export default async function AdminLoginPage({
  searchParams,
}: PageProps<"/admin/login">) {
  const { next } = await searchParams;
  const { t } = await getI18n();
  return (
    <div className="flex min-h-dvh flex-col bg-ivory font-display">
      <main className="flex flex-1 items-center justify-center px-5 py-6">
        <section className="mx-auto w-full max-w-md">
          <Breadcrumbs current={t.account.staffSignIn} />
          <p className="text-[0.68rem] font-medium tracking-[0.28em] text-sage uppercase">
            Staff
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-forest sm:text-3xl">
            Sign in
          </h1>
          <p className="mt-1.5 text-[0.85rem] leading-snug text-sage">
            Sign in to the salon dashboard.
          </p>
          <LoginForm next={typeof next === "string" ? next : "/admin"} />
          <p className="mt-2 text-center text-[0.82rem] text-sage">
            <Link
              href="/account/login"
              className="font-medium text-ink underline-offset-2 hover:underline"
            >
              Customer sign in
            </Link>
          </p>
          <p className="mt-1 text-center text-[0.78rem] text-sage">
            <Link
              href="/"
              className="underline-offset-2 hover:text-ink hover:underline"
            >
              Back to home
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
