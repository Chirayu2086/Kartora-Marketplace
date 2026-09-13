import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
      <p className="text-5xl font-black text-brand">404</p>
      <h1 className="text-xl font-bold">Page not found</h1>
      <p className="text-sm text-gray-500">The page you are looking for was moved, removed or never existed.</p>
      <Link href="/"><Button>Back to Home</Button></Link>
    </div>
  );
}
