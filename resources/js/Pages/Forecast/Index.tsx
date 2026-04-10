import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { fmt } from '@/utils/currency';

interface ForecastMonth {
    month: number;
    year: number;
    label: string;
    projected_income: number;
    projected_expenses: number;
    net: number;
    cumulative_balance: number;
    budget_alerts: string[];
}

interface ForecastSummary {
    current_balance: number;
    projected_balance_12m: number;
    total_projected_income: number;
    total_projected_expenses: number;
    net_over_12_months: number;
    budget_alerts_count: number;
    trend: 'positive' | 'negative';
}

interface ForecastData {
    current_balance: number;
    months: ForecastMonth[];
    summary: ForecastSummary;
    insights?: string[];
}

interface Props {
    forecast: ForecastData | null;
    plan: { slug: string; has_forecast: boolean; name: string };
}


function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
    const pct = max > 0 ? (value / max) * 100 : 0;
    return (
        <div className="flex items-end h-20 w-full gap-0.5">
            <div className="relative flex-1">
                <div className="absolute bottom-0 w-full rounded-t transition-all duration-500"
                    style={{ height: `${pct}%`, backgroundColor: color, minHeight: 4 }} />
            </div>
        </div>
    );
}

export default function ForecastIndex({ forecast, plan }: Props) {
    if (!plan.has_forecast || !forecast) {
        return (
            <AppLayout header={
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Prévisionnel</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Projection financière sur 12 mois</p>
                </div>
            }>
                <Head title="Prévisionnel" />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="ft-card-static max-w-md text-center p-10">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 text-3xl mx-auto mb-5">
                            📊
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Fonctionnalité Premium</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            Le prévisionnel sur 12 mois est réservé aux abonnés Premium.
                            Projetez vos revenus, dépenses et solde avec précision.
                        </p>
                        <div className="space-y-2 text-left bg-slate-100 dark:bg-slate-800/50 rounded-xl p-4 mb-6">
                            {['Projection sur 12 mois','Alertes de dépassement de budget','Analyse des transactions récurrentes','Tendance globale (hausse/baisse)'].map(f => (
                                <div key={f} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                    <span className="text-blue-400">✓</span> {f}
                                </div>
                            ))}
                        </div>
                        <Link href="/subscription/upgrade" className="btn-primary w-full justify-center">
                            ✨ Passer au plan Premium — 1 490 DA/mois
                        </Link>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const maxIncome = Math.max(...forecast.months.map(m => m.projected_income));
    const maxExpense = Math.max(...forecast.months.map(m => m.projected_expenses));
    const maxVal = Math.max(maxIncome, maxExpense, 1);

    const allAlerts = forecast.months.flatMap(m => m.budget_alerts.map(a => ({ message: a, label: m.label })));

    return (
        <AppLayout header={
            <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Prévisionnel 12 mois</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Projection basée sur vos transactions récurrentes</p>
            </div>
        }>
            <Head title="Prévisionnel" />

            <div className="space-y-6">
                {/* Summary cards */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <div className="stat-card">
                        <div className="stat-card__icon bg-blue-500/10">
                            <span className="text-xl">🏦</span>
                        </div>
                        <div>
                            <p className="stat-card__label">Solde actuel</p>
                            <p className={`stat-card__value ${forecast.summary.current_balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {fmt(forecast.summary.current_balance)}
                            </p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className={`stat-card__icon ${forecast.summary.trend === 'positive' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                            <span className="text-xl">{forecast.summary.trend === 'positive' ? '📈' : '📉'}</span>
                        </div>
                        <div>
                            <p className="stat-card__label">Solde prévu dans 12 mois</p>
                            <p className={`stat-card__value ${forecast.summary.projected_balance_12m >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {fmt(forecast.summary.projected_balance_12m)}
                            </p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card__icon bg-emerald-500/10">
                            <span className="text-xl">💹</span>
                        </div>
                        <div>
                            <p className="stat-card__label">Revenus sur 12 mois</p>
                            <p className="stat-card__value text-emerald-400">{fmt(forecast.summary.total_projected_income)}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card__icon bg-rose-500/10">
                            <span className="text-xl">💸</span>
                        </div>
                        <div>
                            <p className="stat-card__label">Dépenses sur 12 mois</p>
                            <p className="stat-card__value text-rose-400">{fmt(forecast.summary.total_projected_expenses)}</p>
                        </div>
                    </div>
                </div>

                {/* AI Insights Card */}
                {forecast.insights && forecast.insights.length > 0 && (
                    <div className="ft-card-static border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-transparent">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xl">🤖</span>
                            <h2 className="section-title text-violet-400">Conseiller IA</h2>
                        </div>
                        <div className="space-y-3">
                            {forecast.insights.map((insight, i) => (
                                <div key={i} className="flex items-start gap-3 bg-violet-500/10 rounded-xl p-3">
                                    <span className="text-violet-400 text-lg">💡</span>
                                    <p className="text-sm text-slate-700 dark:text-slate-300" dangerouslySetInnerHTML={{ __html: insight }}></p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Chart - Bar visualization */}
                <div className="ft-card-static">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="section-title">Projection mensuelle</h2>
                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500 inline-block" />Revenus</span>
                            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-rose-500 inline-block" />Dépenses</span>
                            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-blue-500 inline-block" />Solde cumulé</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <div className="min-w-[700px]">
                            {/* Bars */}
                            <div className="flex items-end gap-2 h-36 mb-2">
                                {forecast.months.map((m, i) => (
                                    <div key={i} className="flex-1 flex items-end gap-0.5 group relative">
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 bg-[#0d1628] border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs whitespace-nowrap shadow-xl">
                                            <p className="font-semibold text-slate-900 dark:text-white mb-1">{m.label}</p>
                                            <p className="text-emerald-400">Rev: {fmt(m.projected_income)}</p>
                                            <p className="text-rose-400">Dép: {fmt(m.projected_expenses)}</p>
                                            <p className={m.net >= 0 ? 'text-blue-400' : 'text-amber-400'}>Net: {fmt(m.net)}</p>
                                        </div>
                                        {/* Income bar */}
                                        <div className="flex-1 flex items-end h-36">
                                            <div className="w-full rounded-t-sm bg-emerald-500/70 hover:bg-emerald-500 transition"
                                                style={{ height: `${(m.projected_income / maxVal) * 100}%`, minHeight: m.projected_income > 0 ? 4 : 0 }}
                                            />
                                        </div>
                                        {/* Expense bar */}
                                        <div className="flex-1 flex items-end h-36">
                                            <div className="w-full rounded-t-sm bg-rose-500/70 hover:bg-rose-500 transition"
                                                style={{ height: `${(m.projected_expenses / maxVal) * 100}%`, minHeight: m.projected_expenses > 0 ? 4 : 0 }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Month labels */}
                            <div className="flex gap-2">
                                {forecast.months.map((m, i) => (
                                    <div key={i} className="flex-1 text-center text-[10px] text-slate-400 dark:text-slate-500 truncate px-0.5">
                                        {m.label.split(' ')[0]}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Monthly table */}
                <div className="ft-card-static">
                    <h2 className="section-title mb-5">Détail mensuel</h2>
                    <div className="overflow-x-auto">
                        <table className="ft-table">
                            <thead>
                                <tr>
                                    <th>Mois</th>
                                    <th className="text-right text-emerald-400/70">Revenus prévus</th>
                                    <th className="text-right text-rose-400/70">Dépenses prévues</th>
                                    <th className="text-right">Net</th>
                                    <th className="text-right">Solde cumulé</th>
                                    <th>Alertes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {forecast.months.map((m, i) => (
                                    <tr key={i}>
                                        <td className="whitespace-nowrap">
                                            <span className="text-sm font-medium text-slate-900 dark:text-white">{m.label}</span>
                                        </td>
                                        <td className="text-right whitespace-nowrap tabular-nums text-sm text-emerald-400 font-medium">
                                            {fmt(m.projected_income)}
                                        </td>
                                        <td className="text-right whitespace-nowrap tabular-nums text-sm text-rose-400 font-medium">
                                            {fmt(m.projected_expenses)}
                                        </td>
                                        <td className="text-right whitespace-nowrap tabular-nums">
                                            <span className={`text-sm font-semibold ${m.net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {m.net >= 0 ? '+' : ''}{fmt(m.net)}
                                            </span>
                                        </td>
                                        <td className="text-right whitespace-nowrap tabular-nums">
                                            <span className={`text-sm font-semibold ${m.cumulative_balance >= 0 ? 'text-blue-400' : 'text-amber-400'}`}>
                                                {fmt(m.cumulative_balance)}
                                            </span>
                                        </td>
                                        <td>
                                            {m.budget_alerts.length > 0 ? (
                                                <span className="badge-warning badge">{m.budget_alerts.length} alerte(s)</span>
                                            ) : (
                                                <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Budget alerts */}
                {allAlerts.length > 0 && (
                    <div className="ft-card-static border-amber-500/20">
                        <h2 className="section-title mb-4 text-amber-400">⚠ Alertes de budget</h2>
                        <div className="space-y-2">
                            {forecast.months.filter(m => m.budget_alerts.length > 0).map((m, i) =>
                                m.budget_alerts.map((alert, j) => (
                                    <div key={`${i}-${j}`} className="flex items-start gap-3 rounded-xl bg-amber-500/5 border border-amber-500/15 p-3">
                                        <span className="text-amber-400 mt-0.5">⚠</span>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{alert}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
