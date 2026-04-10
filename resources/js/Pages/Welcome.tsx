import { Head, Link } from '@inertiajs/react';

interface Props {
    auth: { user: { name: string } | null };
}

const FEATURES = [
    { icon: '📊', title: 'Tableau de bord', desc: 'Visualisez vos finances en temps réel avec des graphiques clairs et intuitifs.' },
    { icon: '💸', title: 'Suivi des dépenses', desc: 'Catégorisez et suivez chaque transaction pour garder le contrôle de votre budget.' },
    { icon: '🎯', title: "Objectifs d'épargne", desc: 'Définissez vos projets et suivez votre progression mois après mois.' },
    { icon: '📈', title: 'Prévisionnel 12 mois', desc: 'Projetez vos revenus et dépenses pour anticiper votre avenir financier.' },
    { icon: '⚠️', title: 'Alertes de budget', desc: "Soyez averti dès que vous approchez de vos limites de dépenses." },
    { icon: '🔄', title: 'Transactions récurrentes', desc: 'Gérez automatiquement vos abonnements et dépenses fixes mensuelles.' },
];

const PLANS = [
    {
        name: 'Gratuit',
        price: '0',
        period: 'DA',
        highlight: false,
        features: ["1 objectif d'épargne", '3 budgets par mois', '50 transactions/mois', 'Dashboard complet'],
        cta: 'Commencer gratuitement',
        href: '/register',
    },
    {
        name: 'Premium',
        price: '1 490',
        period: 'DA / mois',
        highlight: true,
        features: ['Objectifs illimités', 'Budgets illimités', 'Transactions illimitées', 'Prévisionnel 12 mois', 'Transactions récurrentes', 'Support prioritaire'],
        cta: 'Démarrer avec Premium',
        href: '/register',
    },
];

function Logo({ size = 'md' }: { size?: 'sm' | 'md' }) {
    const s = size === 'sm' ? 'h-7 w-7' : 'h-9 w-9';
    const icon = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4.5 w-4.5';
    return (
        <div className={`flex ${s} items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600`}>
            <svg className={`${icon} text-white`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
    );
}

export default function Welcome({ auth }: Props) {
    return (
        <div className="min-h-screen bg-white">
            <Head title="FinanceTracker — Gérez vos finances personnelles" />

            {/* ── Navbar ── */}
            <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
                <div className="mx-auto max-w-6xl px-6 flex items-center justify-between h-16">
                    <div className="flex items-center gap-2.5">
                        <Logo size="sm" />
                        <span className="text-sm font-bold text-slate-900">FinanceTracker</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {auth.user ? (
                            <Link href="/dashboard" className="btn-primary">
                                Mon tableau de bord →
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" className="hidden sm:block text-sm font-medium text-slate-600 hover:text-slate-900 transition px-3 py-2 rounded-lg hover:bg-slate-50">
                                    Se connecter
                                </Link>
                                <Link href="/register" className="btn-primary">
                                    Commencer gratuitement
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/60 to-violet-50/40 py-24 px-6">
                {/* Decorative blobs */}
                <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-violet-200/30 blur-3xl" />

                <div className="mx-auto max-w-4xl text-center relative">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 border border-indigo-200/50 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 mb-6">
                        ✨ Votre gestionnaire de finances personnel
                    </span>
                    <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
                        Prenez le contrôle<br />
                        de <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">vos finances</span>
                    </h1>
                    <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Suivez vos dépenses, atteignez vos objectifs d'épargne et planifiez
                        votre avenir financier avec des outils simples et puissants.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href={auth.user ? '/dashboard' : '/register'}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500 transition active:scale-95"
                        >
                            {auth.user ? 'Accéder au dashboard' : 'Commencer gratuitement'}
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                        {!auth.user && (
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-base font-semibold text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 transition"
                            >
                                Se connecter
                            </Link>
                        )}
                    </div>
                    <p className="text-sm text-slate-400 mt-5">Gratuit pour commencer · Aucune carte requise</p>
                </div>
            </section>

            {/* ── Stats ── */}
            <section className="border-y border-slate-100 bg-white py-12 px-6">
                <div className="mx-auto max-w-4xl grid grid-cols-3 gap-8 text-center">
                    {[
                        { value: '10K+', label: 'Utilisateurs actifs' },
                        { value: '2M DA+', label: 'Transactions suivies' },
                        { value: '4.9/5', label: 'Note moyenne' },
                    ].map(s => (
                        <div key={s.label}>
                            <p className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">{s.value}</p>
                            <p className="text-sm text-slate-500 mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Features ── */}
            <section className="py-24 px-6 bg-slate-50">
                <div className="mx-auto max-w-5xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-3">Tout ce dont vous avez besoin</h2>
                        <p className="text-slate-500 text-lg">Des outils pensés pour vous aider à mieux gérer votre argent au quotidien.</p>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {FEATURES.map(f => (
                            <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 group">
                                <div className="text-3xl mb-4 transition-transform duration-200 group-hover:scale-110">{f.icon}</div>
                                <h3 className="text-base font-semibold text-slate-900 mb-2">{f.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Pricing ── */}
            <section className="py-24 px-6 bg-white">
                <div className="mx-auto max-w-3xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-3">Tarifs simples et transparents</h2>
                        <p className="text-slate-500 text-lg">Commencez gratuitement, passez au Premium quand vous êtes prêt.</p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {PLANS.map(p => (
                            <div key={p.name} className={`rounded-2xl border p-8 ${p.highlight ? 'border-indigo-300 bg-gradient-to-br from-indigo-50 to-violet-50 shadow-lg shadow-indigo-100/80' : 'border-slate-200 bg-slate-50/60'}`}>
                                {p.highlight && (
                                    <span className="inline-flex items-center rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white mb-4">
                                        ⭐ Recommandé
                                    </span>
                                )}
                                <h3 className="text-xl font-bold text-slate-900 mb-1">{p.name}</h3>
                                <div className="flex items-end gap-1.5 mb-6">
                                    <span className="text-4xl font-extrabold text-slate-900">{p.price}</span>
                                    <span className="text-slate-500 text-sm mb-1.5">{p.period}</span>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {p.features.map(f => (
                                        <li key={f} className="flex items-center gap-2.5 text-sm text-slate-700">
                                            <svg className={`h-4 w-4 shrink-0 ${p.highlight ? 'text-indigo-600' : 'text-emerald-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href={auth.user ? '/dashboard' : p.href}
                                    className={`block w-full text-center rounded-xl py-3 text-sm font-semibold transition active:scale-95 ${p.highlight ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-500' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}
                                >
                                    {auth.user ? 'Accéder au dashboard' : p.cta}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA Banner ── */}
            <section className="py-20 px-6 bg-gradient-to-br from-indigo-600 to-violet-700 relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.1),transparent_50%)]" />
                <div className="mx-auto max-w-2xl text-center relative">
                    <h2 className="text-3xl font-bold text-white mb-4">Prêt à reprendre le contrôle ?</h2>
                    <p className="text-indigo-200 mb-8 text-lg">
                        Rejoignez des milliers d'utilisateurs qui gèrent leurs finances avec FinanceTracker.
                    </p>
                    <Link
                        href={auth.user ? '/dashboard' : '/register'}
                        className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-indigo-600 shadow-lg hover:bg-indigo-50 transition active:scale-95"
                    >
                        {auth.user ? 'Accéder au dashboard' : 'Créer mon compte gratuit'}
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="border-t border-slate-100 bg-white py-8 px-6">
                <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        <Logo size="sm" />
                        <span className="text-sm font-semibold text-slate-700">FinanceTracker</span>
                    </div>
                    <div className="flex items-center gap-6 text-xs text-slate-400">
                        <Link href="/login" className="hover:text-slate-600 transition">Connexion</Link>
                        <Link href="/register" className="hover:text-slate-600 transition">Inscription</Link>
                        <span>© {new Date().getFullYear()} FinanceTracker</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
