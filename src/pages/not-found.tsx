import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h1 className="text-6xl font-bold text-foreground">404</h1>
      <p className="text-muted-foreground">This page could not be found.</p>
      <Link href="/" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
        Back to Dashboard
      </Link>
    </div>
  );
}
