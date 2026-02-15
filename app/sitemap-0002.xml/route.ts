import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  const p = path.join(process.cwd(), "public", "sitemap-0002.xml");
  const xml = await fs.readFile(p, "utf8");
  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
