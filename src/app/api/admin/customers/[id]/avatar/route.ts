import { getAdminAccess } from "@/server/auth/access";
import { getSession } from "@/server/auth/session";
import { getDb } from "@/server/db";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return new Response(null, { status: 401 });
  const access = await getAdminAccess(session.username);
  if (!access.owner && !access.areas.includes("bookings")) return new Response(null, { status: 403 });
  const { id } = await params;
  const row = await getDb().customer.findUnique({ where: { id }, select: { avatar: true, avatarType: true } });
  if (!row?.avatar || !row.avatarType) return new Response(null, { status: 404 });
  return new Response(Buffer.from(row.avatar), {
    headers: {
      "Content-Type": row.avatarType,
      "Cache-Control": "private, no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
