import './globals.css';

export const metadata = {
  title: 'Fasinu David Omotayo — Software Developer, Designer & Data Analyst',
  description:
    'Portfolio of Fasinu David Omotayo — software development, graphic design, and data analysis.',
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
