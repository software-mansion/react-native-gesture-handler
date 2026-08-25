import type { ReactNode } from 'react';

export const metadata = {
  title: 'react-gesture-handler Next example',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'sans-serif', margin: 0 }}>{children}</body>
    </html>
  );
}
