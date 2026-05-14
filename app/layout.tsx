import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { Toaster } from 'react-hot-toast';

const inter      = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jakarta    = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' });

export const metadata: Metadata = {
  title:       'Stockhold – Smart Inventory Management',
  description: 'Inventory, billing, and analytics for Indian shop owners',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jakarta.variable} font-sans`}>
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: { borderRadius: '12px', background: '#1e293b', color: '#fff', fontSize: '13px' },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
