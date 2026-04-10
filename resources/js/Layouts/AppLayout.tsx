import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';
import { useTheme } from '@/hooks/useTheme';

interface NavItem {
    href: string;
    label: string;
    routeName: string;
    icon: ReactNode;
}

/* ─── Icons ─────────────────────────────────────────────────────────────── */
const DashboardIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);
const TransactionIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
);
const BudgetIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
);
const GoalIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);
const ForecastIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
    </svg>
);
const AnalyticsIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);
const ProfileIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);
const SettingsIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const LogoutIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);
const MenuIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);
const XIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const SunIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10A5 5 0 0012 7z" />
    </svg>
);
const MoonIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
);

const NAV_ITEMS: NavItem[] = [
    { href: '/dashboard',    label: 'Dashboard',    routeName: 'dashboard',          icon: <DashboardIcon /> },
    { href: '/analytics',    label: 'Analyses',     routeName: 'analytics.index',    icon: <AnalyticsIcon /> },
    { href: '/transactions', label: 'Transactions', routeName: 'transactions.index', icon: <TransactionIcon /> },
    { href: '/budgets',      label: 'Budgets',      routeName: 'budgets.index',      icon: <BudgetIcon /> },
    { href: '/goals',        label: 'Objectifs',    routeName: 'goals.index',        icon: <GoalIcon /> },
    { href: '/forecast',     label: 'Prévisionnel', routeName: 'forecast.index',     icon: <ForecastIcon /> },
];

/* ─── Theme Toggle Button ────────────────────────────────────────────────── */
function ThemeToggle() {
    const { theme, toggle } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            onClick={toggle}
            aria-label={isDark ? 'Passer au mode clair' : 'Passer au mode sombre'}
            title={isDark ? 'Mode clair' : 'Mode sombre'}
            className={`
                relative flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold
                transition-all duration-200 active:scale-95 w-full
                ${isDark
                    ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }
            `}
        >
            <span className={`flex h-5 w-5 items-center justify-center rounded-md transition-all ${isDark ? 'text-amber-400' : 'text-indigo-600'}`}>
                {isDark ? <SunIcon /> : <MoonIcon />}
            </span>
            {isDark ? 'Mode clair' : 'Mode sombre'}

            {/* Pill indicator */}
            <span className={`ml-auto h-4 w-7 rounded-full transition-all duration-300 ${isDark ? 'bg-indigo-500' : 'bg-slate-300'} relative`}>
                <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-all duration-300 ${isDark ? 'left-3.5' : 'left-0.5'}`} />
            </span>
        </button>
    );
}

/* ─── Layout ─────────────────────────────────────────────────────────────── */
export default function AppLayout({ children, header }: PropsWithChildren<{ header?: ReactNode }>) {
    const { auth } = usePage().props as any;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { theme } = useTheme();

    const isActive = (routeName: string) => {
        try { return route().current(routeName); } catch { return false; }
    };

    return (
        <div className="flex min-h-screen transition-colors duration-200" style={{ backgroundColor: 'var(--color-bg-page)' }}>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── Sidebar ── */}
            <aside
                className={`
                    fixed top-0 left-0 z-30 h-full w-64 transform
                    border-r transition-all duration-300 ease-in-out flex flex-col shadow-xl
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0 lg:static lg:z-auto lg:shadow-none
                `}
                style={{
                    backgroundColor: 'var(--color-sidebar)',
                    borderColor: 'var(--color-border)',
                }}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-6 py-5" style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/30 shrink-0">
                        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-bold" style={{ color: 'var(--color-text-1)' }}>FinanceTracker</p>
                        <p className="text-xs" style={{ color: 'var(--color-text-3)' }}>Gestion financière</p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
                    <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-3)' }}>
                        Menu
                    </p>
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.routeName}
                            href={item.href}
                            className={`nav-link ${isActive(item.routeName) ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="nav-icon" style={{ color: isActive(item.routeName) ? 'var(--color-accent)' : 'var(--color-text-3)' }}>
                                {item.icon}
                            </span>
                            {item.label}
                        </Link>
                    ))}

                    <div className="pt-4 mt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                        <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-3)' }}>
                            Compte
                        </p>
                        <Link href="/profile" className={`nav-link ${isActive('profile.edit') ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                            <span className="nav-icon" style={{ color: isActive('profile.edit') ? 'var(--color-accent)' : 'var(--color-text-3)' }}>
                                <ProfileIcon />
                            </span>
                            Profil
                        </Link>
                        <Link href="/settings" className={`nav-link ${isActive('settings') ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                            <span className="nav-icon" style={{ color: isActive('settings') ? 'var(--color-accent)' : 'var(--color-text-3)' }}>
                                <SettingsIcon />
                            </span>
                            Paramètres
                        </Link>
                    </div>
                </nav>

                {/* User + theme toggle + logout */}
                <div className="p-4 space-y-2" style={{ borderTop: '1px solid var(--color-border)' }}>
                    {/* Theme toggle */}
                    <ThemeToggle />

                    {/* User info */}
                    <div className="flex items-center gap-3 rounded-xl p-2.5"
                        style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 8%, transparent)' }}>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-bold text-white shrink-0">
                            {auth?.user?.name?.[0]?.toUpperCase() ?? 'U'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-1)' }}>
                                {auth?.user?.name}
                            </p>
                            <p className="text-xs truncate" style={{ color: 'var(--color-text-3)' }}>
                                {auth?.user?.email}
                            </p>
                        </div>
                    </div>

                    {/* Logout */}
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="btn-secondary w-full justify-center text-xs py-2"
                    >
                        <LogoutIcon />
                        Déconnexion
                    </Link>
                </div>
            </aside>

            {/* ── Main ── */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile top bar */}
                <header className="flex items-center justify-between px-4 py-3 border-b lg:hidden shadow-sm"
                    style={{ backgroundColor: 'var(--color-sidebar)', borderColor: 'var(--color-border)' }}>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="btn-icon"
                        aria-label="Toggle menu"
                    >
                        {sidebarOpen ? <XIcon /> : <MenuIcon />}
                    </button>
                    <p className="text-sm font-bold gradient-text">FinanceTracker</p>
                    <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-bold text-white">
                        {auth?.user?.name?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                </header>

                {/* Page header */}
                {header && (
                    <div className="border-b px-6 py-4 shadow-sm"
                        style={{ backgroundColor: 'var(--color-sidebar)', borderColor: 'var(--color-border)' }}>
                        {header}
                    </div>
                )}

                {/* Content */}
                <main className="flex-1 overflow-auto p-4 lg:p-6 animate-fade-in">
                    {children}
                </main>
            </div>
        </div>
    );
}
