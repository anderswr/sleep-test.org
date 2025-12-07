import { notFound } from "next/navigation";
import ResultPageClient from "./ResultPageClient";

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  return <ResultPageClient id={id} />;
}
