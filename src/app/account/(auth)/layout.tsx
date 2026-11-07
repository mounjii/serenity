export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-ivory font-display">
      <main className="flex flex-1 flex-col px-5 py-6">
        <div className="my-auto w-full">{children}</div>
      </main>
    </div>
  );
}
