import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useI18n } from "@/app/providers/I18nProvider";
import { marked } from "marked";
import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

const VALID = new Set(["fall-asleep","screen-time"]);

async function loadMd(lang: "nb"|"en", slug: string) {
  const fp = path.join(process.cwd(), "public", "articles", lang, `${slug}.md`);
  try { return await fs.readFile(fp, "utf8"); } catch { return null; }
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  if (!VALID.has(slug)) return <div className="container">Not found</div>;
  // språk velges via client provider – men på serverside bruker vi nb fallback
  // siden dette er RSC, rendres html og rehydreres med riktig språk ved navigasjon.
  const md = await loadMd("nb", slug) || "# Not found";
  const html = marked.parse(md);

  return (
    <>
      <SiteHeader />
      <main className="container">
        <article className="card" dangerouslySetInnerHTML={{ __html: html }} />
      </main>
      <SiteFooter />
    </>
  );
}
