import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import stadiumBg from "@/assets/stadium-bg.jpg";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center card-premium rounded-2xl p-10">
        <h1 className="text-7xl font-display gradient-text-gold">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Página fora de campo</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que você procura não existe ou foi movida.
        </p>
        <div className="mt-6">
          <Link to="/" className="btn-gold inline-flex rounded-md px-5 py-2.5 text-sm">
            Voltar ao estádio
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center card-premium rounded-2xl p-10">
        <h1 className="text-xl font-semibold">Algo saiu do gramado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Tente novamente em alguns instantes.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="btn-gold rounded-md px-4 py-2 text-sm"
          >
            Tentar de novo
          </button>
          <a href="/" className="inline-flex items-center rounded-md border border-border bg-card px-4 py-2 text-sm">
            Início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Copa MRT 2026 — O jogo das vendas começou" },
      { name: "description", content: "Painel oficial da Copa MRT 2026. Ranking em tempo real das franquias e vendedores do Grupo MRT. Cada venda vale pontos. Cada ponto aproxima da taça." },
      { property: "og:title", content: "Copa MRT 2026 — O jogo das vendas começou" },
      { property: "og:description", content: "Painel oficial da Copa MRT 2026. Ranking em tempo real das franquias e vendedores do Grupo MRT. Cada venda vale pontos. Cada ponto aproxima da taça." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Copa MRT 2026 — O jogo das vendas começou" },
      { name: "twitter:description", content: "Painel oficial da Copa MRT 2026. Ranking em tempo real das franquias e vendedores do Grupo MRT. Cada venda vale pontos. Cada ponto aproxima da taça." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3d074a89-61a7-450a-b339-ad048c31680d/id-preview-a6edc859--abdf4f3d-3606-491d-9d35-62f8dd981926.lovable.app-1781894929377.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3d074a89-61a7-450a-b339-ad048c31680d/id-preview-a6edc859--abdf4f3d-3606-491d-9d35-62f8dd981926.lovable.app-1781894929377.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      {/* Estádio fixo de fundo + camadas para legibilidade */}
      <div
        aria-hidden
        className="fixed inset-0 -z-30 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${stadiumBg})` }}
      />
      <div
        aria-hidden
        className="fixed inset-0 -z-20"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.16 0.08 152 / 0.42) 0%, oklch(0.14 0.08 152 / 0.52) 50%, oklch(0.18 0.10 150 / 0.62) 100%)",
        }}
      />
      <div
        aria-hidden
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 50% 0%, oklch(0.88 0.18 95 / 40%) 0%, transparent 60%)",
        }}
      />
      <Outlet />
    </QueryClientProvider>
  );
}
