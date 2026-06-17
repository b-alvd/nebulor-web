'use client';

import { usePathname } from 'next/navigation';
import Footer from '@/components/Footer';
import ScrollTopButton from '@/components/ScrollTopButton';

export default function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname === '/personnages') return null;
  return (
    <>
      <Footer />
      <ScrollTopButton />
    </>
  );
}
