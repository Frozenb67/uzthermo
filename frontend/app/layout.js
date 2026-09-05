import './globals.css';
import TopBar from '../components/layout/TopBar';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import StoreHydration from '../components/StoreHydration';

export const metadata = {
  title: 'UzThermo — Boilers, Pipes, Fittings & Climate Systems',
  description:
    'Plumbing, heating & climate systems store: gas boilers, PPR/PEX pipes, brass fittings, circulation pumps, and radiators — with certified installers.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <StoreHydration />
        <TopBar />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
