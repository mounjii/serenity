import Image from "next/image";
import Link from "next/link";
import LoginForm from "@/components/admin/LoginForm";

export default async function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  const { next } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm rounded-sm bg-white p-8 shadow-[0_20px_40px_-28px_rgba(60,40,20,0.35)]">
        <Image
          src="/images/touch-sense-logo.webp"
          alt="Touch Sense Thai Massage"
          width={650}
          height={451}
          priority
          className="mx-auto h-24 w-auto"
        />
        <h1 className="mt-5 text-center font-serif text-3xl text-ink">Admin sign in</h1>
        <LoginForm next={typeof next === "string" ? next : "/admin"} />
        <Link
          href="/"
          className="mt-4 flex min-h-12 w-full items-center justify-center rounded-full border border-sand text-[0.8rem] tracking-wide text-ink transition hover:border-ink"
        >
          ← Back to home
        </Link>
      </div>
    </main>
  );
}
