import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import TickerRibbon from '@/components/TickerRibbon';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'EduTradeX — Real-time Virtual Stock Market for Schools',
  description:
    'Simulasi Bursa Efek Indonesia (BEI/IDX) untuk siswa SMP/SMA dan guru ekonomi dengan data harga riil, order engine akurat, dan leaderboard kelas.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-emerald-500 selection:text-slate-950`}
      >
        <AuthProvider>
          <TickerRibbon />
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center space-x-2 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>EduTradeX v2.4 • Zero Financial Risk, 100% Real-Market Dynamics</span>
              </div>
              <div>Bursa Efek Indonesia Dummy Ledger Engine • 1 Lot = 100 Lembar</div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
