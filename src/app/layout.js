import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://fasinu-david-omotayo.vercel.app';
const TITLE = 'Fasinu David Omotayo — Software Developer, Designer & Data Analyst';
const DESCRIPTION =
  'Portfolio of Fasinu David Omotayo — software development, graphic design, and data analysis.';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Fasinu David Omotayo',
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Fasinu David Omotayo — Portfolio' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Runs before paint so the site never flashes the wrong theme.
            Scoped to public pages only - a visitor's theme choice is
            personal to them and should never change how the admin
            dashboard looks, even in the same browser. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  if (window.location.pathname.startsWith('/admin')) return;
                  var theme = localStorage.getItem('theme');
                  if (theme === 'light') document.documentElement.classList.add('light');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}