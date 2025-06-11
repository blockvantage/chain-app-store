import '../styles/globals.css';
import React from 'react';
import type { AppProps } from 'next/app';
import Layout from '../components/Layout';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ThemeProvider } from 'next-themes';

export default function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // This ensures that the app is only rendered client-side to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <ThemeProvider attribute="class">
      <Component {...pageProps} key={router.asPath} />
    </ThemeProvider>
  );
}
