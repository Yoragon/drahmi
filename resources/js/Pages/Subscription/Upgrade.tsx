import AppLayout from '@/Layouts/AppLayout';
import { Head, router, usePage } from '@inertiajs/react';

interface PageProps {
    auth: { user: { id: number; name: string; email: string; plan: { slug: string } } };
    [key: string]: unknown;
}

const PLANS = [
    {
        name: 'Free',
        slug: 'free',
        price: '0 DA',
        period: 'pour toujours',
        color: 'from-slate-500/20 to-slate-600/20',
        border: 'border-slate-500/30',
        features: [
            '50 transactions/mois',
            '3 budgets mensuels',
            '1 objectif d\'épargne',
            'Historique 3 mois',
        ],
        missing: ['Transactions récurrentes', 'Prévisionnel 12 mois', 'Objectifs illimités', 'Export CSV/PDF'],
    },
    {
        name: 'Premium',
        slug: 'premium',
        price: '1 490 DA',
        period: '/mois',
        color: 'from-blue-500/20 to-violet-600/20',
        border: 'border-blue-500/40',
        badge: '⭐ Recommandé',
        features: [
            'Transactions illimitées',
            'Budgets illimités',
            'Objectifs d\'épargne illimités',
            'Transactions récurrentes',
            'Prévisionnel sur 12 mois',
            'Export CSV/PDF',
            'Support prioritaire',
        ],
        missing: [],
    },
];

export default function SubscriptionUpgrade() {
    const { auth } = usePage<PageProps>().props;
    const currentSlug = auth.user.plan.slug;

    function handleUpgrade(slug: string) {
        if (slug === currentSlug) return;
        router.post(route('subscription.upgrade.post'), { plan: slug });
    }

    return (
        <AppLayout header={
            <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Passer Premium</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Débloquez toutes les fonctionnalités de FinanceTracker</p>
            </div>
        }>
            <Head title="Upgrade Premium" />

            <div className="max-w-3xl mx-auto py-8">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold gradient-text mb-3">Choisissez votre plan</h2>
                    <p className="text-slate-500 dark:text-slate-400">Commencez gratuitement, passez Premium quand vous êtes prêt.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {PLANS.map(plan => {
                        const isCurrent = plan.slug === currentSlug;
                        return (
                            <div key={plan.slug}
                                className={`relative rounded-2xl border bg-gradient-to-br p-6 ${plan.border} ${plan.color} ${plan.badge ? 'shadow-lg shadow-blue-500/10' : ''}`}
                            >
                                {plan.badge && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="badge-info badge shadow-lg">{plan.badge}</span>
                                    </div>
                                )}
                                {isCurrent && (
                                    <div className="absolute top-3 right-3">
                                        <span className="badge badge-success text-xs">Plan actuel</span>
                                    </div>
                                )}

                                <div className="mb-5">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{plan.name}</h3>
                                    <div className="flex items-end gap-1">
                                        <span className="text-3xl font-black text-slate-900 dark:text-white">{plan.price}</span>
                                        <span className="text-sm text-slate-500 dark:text-slate-400 mb-1">{plan.period}</span>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6">
                                    {plan.features.map(f => (
                                        <div key={f} className="flex items-center gap-2 text-sm text-slate-900 dark:text-white">
                                            <span className="text-emerald-400 font-bold">✓</span> {f}
                                        </div>
                                    ))}
                                    {plan.missing.map(f => (
                                        <div key={f} className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500 line-through">
                                            <span className="text-slate-400 dark:text-slate-500">✗</span> {f}
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => handleUpgrade(plan.slug)}
                                    disabled={isCurrent}
                                    className={isCurrent
                                        ? 'btn-secondary w-full justify-center cursor-not-allowed opacity-60'
                                        : 'btn-primary w-full justify-center'}
                                >
                                    {isCurrent ? 'Plan actuel' : plan.slug === 'premium' ? 'Passer Premium' : 'Rétrograder'}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-8">
                    🔒 Paiement sécurisé · Annulation à tout moment · Pas d'engagement
                </p>
            </div>
        </AppLayout>
    );
}
