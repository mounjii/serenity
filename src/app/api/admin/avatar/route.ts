import { adminAvatar } from "@/server/avatar";
import { getSession } from "@/server/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session) return new Response(null, { status: 401 });
  const image = await adminAvatar(session.username);
  if (!image) return new Response(null, { status: 404 });
  return new Response(Buffer.from(image.bytes), {
    headers: {
      "Content-Type": image.type,
      "Cache-Control": "private, no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
