// app/administration/components/ProgressBar.tsx
"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function ProgressBar() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Start loading on path change, but don't clear immediately
    setLoading(true);

    // Use a timer to simulate loading completion.
    // This gives the user feedback that a page change is happening.
    const timer = setTimeout(() => {
      setLoading(false);
    }, 750); // Adjust duration as needed

    return () => {
      clearTimeout(timer);
    };
  }, [pathname]); // Rerun effect when pathname changes

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50">
      <div
        className={`h-full bg-gradient-to-r from-blue-900 to-blue-700 transition-transform duration-500 ease-out ${
          loading ? 'transform-none' : '-translate-x-full'
        }`}
      />
    </div>
  );
}