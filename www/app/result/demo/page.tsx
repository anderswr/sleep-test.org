import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function DemoResult() {
  const example = {
    id: "DEMO123",
    sleepScore: 72,
    categoryScores: { pattern: 30, insomnia: 40, quality: 35, daytime: 45, hygiene: 20, environment: 25, breathing: 15 }
  };
  return (
    <>
      <SiteHeader />
      <main className="container">
        <article className="card">
          <h1>Eksempelrapport</h1>
          <p><strong>Søvn-score:</strong> {example.sleepScore}</p>
          <ul>
            {Object.entries(example.categoryScores).map(([k,v])=> (<li key={k}>{k}: {v}</li>))}
          </ul>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
