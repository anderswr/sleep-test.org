// app/page.tsx
import { redirect } from "next/navigation";

export default function RootRedirect() {
  // 🚀 Default: alltid til engelsk (trygg og SEO-vennlig)
  redirect("/en");
}
