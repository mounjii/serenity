import { readFile } from "node:fs/promises";
import path from "node:path";

/** Local flag SVGs. The page cannot load a flag CDN because the content policy only allows this site. */
export async function GET(_request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  if (!/^[a-z]{2}\.svg$/.test(code)) return new Response(null, { status: 404 });
  const file = path.join(process.cwd(), "node_modules", "country-flag-icons", "3x2", `${code.slice(0, 2).toUpperCase()}.svg`);
  try {
    const svg = await readFile(file);
    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
