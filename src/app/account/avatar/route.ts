import { customerAvatar } from "@/server/avatar";
import { getCustomerSession } from "@/server/customer/session";

export async function GET() {
  const session = await getCustomerSession();
  if (!session) return new Response(null, { status: 401 });
  const image = await customerAvatar(session.id);
  if (!image) return new Response(null, { status: 404 });
  return new Response(Buffer.from(image.bytes), {
    headers: {
      "Content-Type": image.type,
      "Cache-Control": "private, no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
