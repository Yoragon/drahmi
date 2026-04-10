/**
 * useTheme – gère le toggle dark/light mode.
 * Persiste le choix dans localStorage et applique la classe 'dark' sur <html>.
 */

import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const KEY = 'ft_theme';

function getInitialTheme(): Theme {
    try {
        const stored = localStorage.getItem(KEY) as Theme | null;
        if (stored === 'dark' || stored === 'light') return stored;
        // Respect system preference if no stored value
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    } catch { /* SSR / no localStorage */ }
    return 'light';
}

function applyTheme(theme: Theme) {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    try { localStorage.setItem(KEY, theme); } catch { /* ignore */ }
}

export function useTheme() {
    const [theme, setTheme] = useState<Theme>('light'); // SSR-safe default

    // After mount, read the real value
    useEffect(() => {
        const initial = getInitialTheme();
        applyTheme(initial);
        setTheme(initial);
    }, []);

    const toggle = () => {
        setTheme(prev => {
            const next: Theme = prev === 'light' ? 'dark' : 'light';
            applyTheme(next);
            return next;
        });
    };

    return { theme, toggle };
}
