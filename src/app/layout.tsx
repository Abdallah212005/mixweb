
import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AuraForge | We Engineer Digital Influence',
  description: 'High-end digital agency specializing in digital marketing and web development.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Source+Code+Pro:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-[#100E11] text-white">{children}</body>
    </html>
  );
}
