import { useEffect, useState } from "react";
import { useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { Home, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { developmentErrorDetails, errorReference, reportPageError } from "@/lib/app-errors";

export function PageError({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);
  const [retryFailed, setRetryFailed] = useState(false);
  const [reference, setReference] = useState<string>();
  const details = developmentErrorDetails(error, import.meta.env.DEV);

  useEffect(() => {
    setReference(errorReference(error));
    reportPageError(error);
  }, [error]);

  async function retry() {
    setRetrying(true);
    setRetryFailed(false);
    try {
      await router.invalidate();
      reset();
    } catch (retryError) {
      reportPageError(retryError);
      setRetryFailed(true);
    } finally {
      setRetrying(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-xl text-center">
        <p className="mb-4 font-display text-sm font-semibold text-primary">Aurevia Bank</p>
        <h1 className="text-2xl font-semibold text-foreground">This page didn’t load</h1>
        <p className="mt-3 text-muted-foreground">Please try again or return to the home page.</p>
        {reference && <p className="mt-3 text-xs text-muted-foreground">Reference: {reference}</p>}
        {retryFailed && <p role="alert" className="mt-3 text-sm text-destructive">The page still couldn’t load. Please try again later.</p>}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={retry} disabled={retrying}><RotateCcw className="h-4 w-4" />{retrying ? "Trying again…" : "Try again"}</Button>
          <Button asChild variant="outline"><a href="/"><Home className="h-4 w-4" />Go home</a></Button>
        </div>
        {details && (
          <details className="mt-8 rounded-lg border border-border bg-muted p-4 text-left">
            <summary className="cursor-pointer text-sm font-medium">Development error details</summary>
            <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap break-all text-xs text-muted-foreground">{details}</pre>
          </details>
        )}
      </div>
    </main>
  );
}

export function PageNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <p className="text-7xl font-bold text-primary">404</p>
        <h1 className="mt-4 text-xl font-semibold">Page not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">The page you’re looking for doesn’t exist or has been moved.</p>
        <Button asChild className="mt-6"><a href="/"><Home className="h-4 w-4" />Go home</a></Button>
      </div>
    </main>
  );
}