import { Analytics } from '@vercel/analytics/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StarField from '@/components/StarField';
import Cursor from '@/components/Cursor';
import ScrollTopButton from '@/components/ScrollTopButton';
import PageTransition from '@/components/PageTransition';
import ConditionalFooter from '@/components/ConditionalFooter';
import '@/styles/variables.css';
import '@/styles/globals.css';

export const metadata = {
  title: 'Nebulor',
  description: 'La prophétie s\'éveille. Et avec elle, tout ce qui dormait.',
  openGraph: {
    title: 'Nebulor',
    description: 'La prophétie s\'éveille. Et avec elle, tout ce qui dormait.',
    images: ['/cover.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <Analytics />
        <StarField />
        <Cursor />
        <Navbar />
        <PageTransition>
          {children}
        </PageTransition>
        <ConditionalFooter />
      </body>
    </html>
  );
}
