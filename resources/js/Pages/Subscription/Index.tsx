import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';

export default function SubscriptionIndex() {
    return (
        <AppLayout header={<h1 className="text-xl font-bold text-slate-900 dark:text-white">Mon abonnement</h1>}>
            <Head title="Abonnement" />
            <div className="ft-card-static max-w-xl">
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-2xl">⭐</div>
                    <div>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">Plan Gratuit</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Actif · 50 tx/mois · 3 budgets · 1 objectif</p>
                    </div>
                </div>
                <Link href="/subscription/upgrade" className="btn-primary">
                    Passer à Premium
                </Link>
            </div>
        </AppLayout>
    );
}
