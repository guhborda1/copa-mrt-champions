import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center card-premium rounded-2xl p-10">
        <h1 className="text-7xl font-display gradient-text-gold">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Página fora de campo</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que você procura não existe ou foi movida.
        </p>
        <div className="mt-6">
          <Link href="/" className="btn-gold inline-flex rounded-md px-5 py-2.5 text-sm">
            Voltar ao estádio
          </Link>
        </div>
      </div>
    </div>
  );
}
