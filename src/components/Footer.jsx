import Image from 'next/image';
import '@/styles/Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <Image src="/nebulor.webp" alt="Nebulor" className="footer__logo-img" width={100} height={70} />
        </div>
        <div className="footer__sep" />
        <div className="footer__rights">
          <p>© {year} <strong>LeZorin</strong> - Tous droits réservés. Toute reproduction interdite sans autorisation.</p>
          <p className="footer__dev">Site développé avec ❤️ par <strong>b-alvd</strong></p>
        </div>
      </div>
    </footer>
  );
}
