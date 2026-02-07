import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-full bg-muted p-4">
                <FileQuestion className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Page not found (404)</h2>
            <p className="text-muted-foreground max-w-[500px]">
                Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been
                removed, had its name changed, or is temporarily unavailable.
            </p>
            <Link
                href="/"
                className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 transition-colors"
            >
                Return Home
            </Link>
        </div>
    );
}
