import ArticlePageClient from "./ArticlePageClient";
import { notFound } from "next/navigation";

type ArticlePageProps = {
  params: Promise<{ slug?: string } | undefined>;
};

export default async function ArticlePage({ params }: ArticlePageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug) {
    notFound();
  }

  return <ArticlePageClient slug={slug} />;
}
