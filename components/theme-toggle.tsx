'use client';

import { useTheme } from 'next-themes';
import { Button } from './ui/button';
import { SunIcon, MoonIcon } from './icons';
import { useEffect, useState } from 'react';

// Step 1: Theme toggle component for switching between light and dark modes
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Step 2: Ensure component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Step 3: Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
        <div className="h-4 w-4" />
      </Button>
    );
  }

  // Step 4: Toggle between light and dark themes
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="h-9 w-9 p-0 hover:bg-muted transition-colors"
      aria-label="Toggle theme"
    >
      {/* Step 5: Show sun icon in dark mode, moon icon in light mode */}
      {theme === 'dark' ? (
        <SunIcon className="h-4 w-4" />
      ) : (
        <MoonIcon className="h-4 w-4" />
      )}
    </Button>
  );
}