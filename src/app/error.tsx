'use client';
import { useEffect } from 'react';
import { reportLovableError } from '@/lib/lovable-error-reporting';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    reportLovableError(error, { boundary: 'next_error_boundary' });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center card-premium rounded-2xl p-10">
        <h1 className="text-xl font-semibold">Algo saiu do gramado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Tente novamente em alguns instantes.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={reset} className="btn-gold rounded-md px-4 py-2 text-sm">
            Tentar de novo
          </button>
          <a
            href="/"
            className="inline-flex items-center rounded-md border border-border bg-card px-4 py-2 text-sm"
          >
            Início
          </a>
        </div>
      </div>
    </div>
  );
}
