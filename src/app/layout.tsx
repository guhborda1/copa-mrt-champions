import type { Metadata } from 'next';
import { Providers } from './providers';
import '@/styles.css';
import stadiumBg from '@/assets/stadium-bg.jpg';

export const metadata: Metadata = {
  title: 'Copa MRT 2026 — O jogo das vendas começou',
  description:
    'Painel oficial da Copa MRT 2026. Ranking em tempo real das franquias e vendedores do Grupo MRT. Cada venda vale pontos. Cada ponto aproxima da taça.',
  openGraph: {
    title: 'Copa MRT 2026 — O jogo das vendas começou',
    description:
      'Painel oficial da Copa MRT 2026. Ranking em tempo real das franquias e vendedores do Grupo MRT. Cada venda vale pontos. Cada ponto aproxima da taça.',
    type: 'website',
    images: [
      'https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3d074a89-61a7-450a-b339-ad048c31680d/id-preview-a6edc859--abdf4f3d-3606-491d-9d35-62f8dd981926.lovable.app-1781894929377.png',
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Copa MRT 2026 — O jogo das vendas começou',
    description:
      'Painel oficial da Copa MRT 2026. Ranking em tempo real das franquias e vendedores do Grupo MRT. Cada venda vale pontos. Cada ponto aproxima da taça.',
    images: [
      'https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3d074a89-61a7-450a-b339-ad048c31680d/id-preview-a6edc859--abdf4f3d-3606-491d-9d35-62f8dd981926.lovable.app-1781894929377.png',
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* Foto do estádio */}
        <div
          aria-hidden
          className="fixed inset-0 -z-40 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${stadiumBg.src})` }}
        />
        {/* Escurecimento */}
        <div
          aria-hidden
          className="fixed inset-0 -z-30 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, oklch(0.14 0.08 152 / 0.32) 0%, oklch(0.12 0.07 152 / 0.40) 55%, oklch(0.18 0.10 150 / 0.55) 100%)',
          }}
        />
        {/* Luzes do estádio */}
        <div aria-hidden className="fixed inset-0 -z-20 stadium-lights pointer-events-none" />
        {/* Halo dourado */}
        <div
          aria-hidden
          className="fixed inset-0 -z-10 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 45% at 50% 0%, oklch(0.88 0.18 95 / 35%) 0%, transparent 60%)',
          }}
        />
        {/* Confetes */}
        <div aria-hidden className="confetti-layer pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          {Array.from({ length: 36 }).map((_, i) => (
            <span
              key={i}
              className={`confetti confetti-${i % 6}`}
              style={{
                left: `${(i * 97) % 100}%`,
                animationDelay: `${(i * 0.37) % 8}s`,
                animationDuration: `${7 + ((i * 13) % 9)}s`,
                background:
                  i % 2 === 0
                    ? 'linear-gradient(135deg, oklch(0.92 0.18 100), oklch(0.78 0.20 88))'
                    : 'linear-gradient(135deg, oklch(0.70 0.22 145), oklch(0.45 0.18 148))',
                transform: `rotate(${(i * 37) % 360}deg)`,
              }}
            />
          ))}
        </div>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
