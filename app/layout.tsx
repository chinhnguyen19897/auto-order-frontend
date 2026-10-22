import type {Metadata} from 'next';
import './globals.css';
import React from "react";
import {SidebarStoreProvider} from "../providers/sidebar-store-provider";

export const metadata: Metadata = {
  title: 'Auto Order · Live commerce',
  description: 'Turn live comments into confirmed orders.',
  robots: {index: false, follow: false}
};
export default function RootLayout({children}: { children: React.ReactNode }) {
  return <html lang="en" suppressHydrationWarning>
      <body>
        <SidebarStoreProvider>{children}</SidebarStoreProvider>
      </body>
  </html>;
}
