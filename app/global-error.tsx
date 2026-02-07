'use client';

import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <html>
            <body className="flex h-screen w-screen flex-col items-center justify-center gap-4 text-center bg-background text-foreground">
                <h2 className="text-2xl font-bold tracking-tight">Something went wrong!</h2>
                <p className="text-muted-foreground">
                    A critical error occurred. Please try refreshing the page.
                </p>
                <button
                    onClick={() => reset()}
                    className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    Try again
                </button>
            </body>
        </html>
    );
}
