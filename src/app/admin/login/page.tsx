import LoginForm from "@/components/admin/LoginForm";

export default async function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  const { next } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm rounded-sm bg-white p-8 shadow-[0_20px_40px_-28px_rgba(60,40,20,0.35)]">
        <p className="eyebrow text-center">Serenity</p>
        <h1 className="mt-3 text-center font-serif text-3xl text-ink">Admin sign in</h1>
        <LoginForm next={typeof next === "string" ? next : "/admin"} />
      </div>
    </main>
  );
}
