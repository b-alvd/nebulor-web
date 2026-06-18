'use client';

import { usePathname } from 'next/navigation';
import Footer from '@/components/Footer';
import ScrollTopButton from '@/components/ScrollTopButton';

export default function ConditionalFooter() {
  const pathname = usePathname();
  const isFullscreen = pathname === '/personnages' || pathname.startsWith('/univers/');
  if (isFullscreen) return null;
  return (
    <>
      <Footer />
      <ScrollTopButton />
    </>
  );
}
