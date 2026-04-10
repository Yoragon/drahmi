import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { fmt } from '@/utils/currency';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid,
    BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';

interface Transaction {
    id: number;
    type: 'income' | 'expense';
    amount: string;
    description: string;
    category: string;
    date: string;
    is_recurring: boolean;
}

interface Stats {
    monthly_income: number;
    monthly_expenses: number;
    monthly_savings: number;
    balance: number;
}

interface ChartsData {
    daily_trends: { day: number, Revenus: number, Dépenses: number }[];
    monthly_trends: { month: string, Revenus: number, Dépenses: number }[];
    expenses_by_category: { name: string, value: number, color: string }[];
}

interface Budget {
    id: number;
    name: string;
    monthly_limit: number;
    spent: number;
    usage_percent: number;
    is_over_budget: boolean;
    color: string;
}

interface Goal {
    id: number;
    name: string;
    target_amount: number;
    current_amount: number;
    progress: number;
    monthly_saving?: number;
    color: string;
}

interface Plan {
    name: string;
    slug: string;
    has_forecast: boolean;
}

interface Props {
    stats: Stats;
    charts: ChartsData;
    recent_transactions: Transaction[];
    budgets: Budget[];
    goals: Goal[];
    forecast: any;
    plan: Plan;
}

const CATEGORY_ICONS: Record<string, string> = {
    'Salaire': '💼', 'Alimentation': '🛒', 'Logement': '🏠',
    'Transport': '🚗', 'Santé': '🏥', 'Loisirs': '🎮',
    'Télécom': '📱', 'Éducation': '📚', 'Vêtements': '👗',
    'Restauration': '🍽️', 'Voyages': '✈️', 'Épargne': '💰',
    'Investissement': '📈', 'Autres': '💳',
};

function StatCard({ label, value, sub, icon, accent }: {
    label: string; value: string; sub?: string;
    icon: string; accent: string;
}) {
    return (
        <div className="stat-card">
            <div className={`stat-card__icon`} style={{ backgroundColor: `${accent}18` }}>
                <span className="text-xl">{icon}</span>
            </div>
            <div>
                <p className="stat-card__label">{label}</p>
                <p className="stat-card__value">{value}</p>
                {sub && <p className="stat-card__sub">{sub}</p>}
            </div>
        </div>
    );
}

export default function Dashboard({ stats, charts, recent_transactions, budgets, goals, plan }: Props) {
    const monthLabel = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

    return (
        <AppLayout header={
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-1)' }}>Tableau de bord</h1>
                    <p className="text-sm capitalize" style={{ color: 'var(--color-text-3)' }}>{monthLabel}</p>
                </div>
                <div className="flex items-center gap-2">
                    {plan.slug === 'free' && <span className="badge badge-warning">Plan Gratuit</span>}
                    {plan.slug === 'premium' && <span className="badge badge-info">✨ Premium</span>}
                    <Link href="/transactions" className="btn-primary">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Ajouter
                    </Link>
                </div>
            </div>
        }>
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Stat cards */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <StatCard label="Revenus du mois"  value={fmt(stats.monthly_income)}   icon="💹" accent="#10b981" />
                    <StatCard label="Dépenses du mois" value={fmt(stats.monthly_expenses)}  icon="📉" accent="#f43f5e" />
                    <StatCard
                        label="Épargne nette" value={fmt(stats.monthly_savings)}
                        sub={stats.monthly_savings >= 0 ? '✓ Positif' : '⚠ Négatif'}
                        icon="💰" accent="#6366f1"
                    />
                    <StatCard label="Solde actuel" value={fmt(stats.balance)} icon="🏦" accent="#8b5cf6" />
                </div>

                {/* Graphics Section 1: Daily Trends & Category Distribution */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Daily Trends */}
                    <div className="lg:col-span-2 ft-card-static flex flex-col h-[400px]">
                        <h2 className="section-title mb-4">Évolution ce mois-ci</h2>
                        <div className="flex-1 min-h-0 w-full text-xs">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={charts.daily_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: 'var(--color-text-3)', fontSize: 12}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--color-text-3)', fontSize: 12}} />
                                    <RechartsTooltip 
                                        contentStyle={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', borderRadius: '12px' }}
                                        itemStyle={{ color: 'var(--color-text-1)', fontWeight: 600 }}
                                        labelStyle={{ color: 'var(--color-text-3)', marginBottom: '4px' }}
                                    />
                                    <Area type="monotone" dataKey="Revenus" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorInc)" />
                                    <Area type="monotone" dataKey="Dépenses" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Expenses by Category */}
                    <div className="ft-card-static flex flex-col h-[400px]">
                        <h2 className="section-title mb-4">Dépenses par catégorie</h2>
                        {charts.expenses_by_category.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-sm" style={{ color: 'var(--color-text-3)' }}>
                                Aucune dépense ce mois-ci
                            </div>
                        ) : (
                            <div className="flex-1 min-h-0 w-full relative flex flex-col">
                                <div className="h-[200px] w-full shrink-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={charts.expenses_by_category}
                                                cx="50%" cy="50%"
                                                innerRadius={60} outerRadius={80}
                                                paddingAngle={2}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {charts.expenses_by_category.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip 
                                                contentStyle={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', borderRadius: '8px', zIndex: 50 }}
                                                itemStyle={{ color: 'var(--color-text-1)', fontWeight: 600 }}
                                                formatter={(value: any) => fmt(Number(value))}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex-1 overflow-y-auto px-2 mt-4 space-y-2">
                                    {charts.expenses_by_category.map((c, i) => (
                                        <div key={i} className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                                                <span className="truncate max-w-[120px]" style={{ color: 'var(--color-text-2)' }}>{c.name}</span>
                                            </div>
                                            <span className="font-semibold shrink-0" style={{ color: 'var(--color-text-1)' }}>{fmt(c.value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Legacy Layout: Transactions & Budgets/Goals */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Recent transactions */}
                    <div className="lg:col-span-2 ft-card-static">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="section-title">Transactions récentes</h2>
                            <Link href="/transactions" className="btn-secondary text-xs py-1.5 px-3">Voir tout</Link>
                        </div>

                        {recent_transactions.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state__icon">💳</div>
                                <p className="empty-state__title">Aucune transaction</p>
                                <p className="empty-state__sub">Commencez par ajouter votre première transaction</p>
                                <Link href="/transactions" className="btn-primary mt-2">Ajouter</Link>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {recent_transactions.map((tx) => (
                                    <div key={tx.id}
                                        className="flex items-center gap-3 rounded-xl p-3 transition-colors"
                                        style={{ ':hover': { backgroundColor: 'color-mix(in srgb, var(--color-accent) 6%, transparent)' } } as any}
                                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-accent) 6%, transparent)')}
                                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
                                            style={{ backgroundColor: 'var(--color-border)' }}>
                                            {CATEGORY_ICONS[tx.category] ?? '💳'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-1)' }}>
                                                {tx.description}
                                            </p>
                                            <p className="text-xs" style={{ color: 'var(--color-text-3)' }}>
                                                {tx.category} · {new Date(tx.date).toLocaleDateString('fr-FR')}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className={tx.type === 'income' ? 'amount-positive text-sm' : 'amount-negative text-sm'}>
                                                {tx.type === 'income' ? '+' : '-'}{fmt(parseFloat(tx.amount))}
                                            </p>
                                            {tx.is_recurring && (
                                                <span className="text-[10px]" style={{ color: 'var(--color-text-3)' }}>🔄 récurrent</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right column */}
                    <div className="space-y-6">
                        {/* Budgets */}
                        <div className="ft-card-static">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="section-title">Budgets</h2>
                                <Link href="/budgets" className="btn-secondary text-xs py-1.5 px-3">Gérer</Link>
                            </div>
                            {budgets.length === 0 ? (
                                <div className="text-center py-6">
                                    <p className="text-sm mb-3" style={{ color: 'var(--color-text-3)' }}>Aucun budget ce mois-ci</p>
                                    <Link href="/budgets" className="btn-secondary text-xs">Créer un budget</Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {budgets.slice(0, 4).map((b) => (
                                        <div key={b.id}>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-xs font-semibold" style={{ color: 'var(--color-text-1)' }}>{b.name}</span>
                                                <span className={`text-xs font-semibold ${b.is_over_budget ? 'text-rose-500' : ''}`}
                                                    style={b.is_over_budget ? {} : { color: 'var(--color-text-3)' }}>
                                                    {fmt(b.spent)}/{fmt(b.monthly_limit)}
                                                </span>
                                            </div>
                                            <div className="progress-bar">
                                                <div className="progress-bar__fill" style={{
                                                    width: `${Math.min(100, b.usage_percent)}%`,
                                                    backgroundColor: b.is_over_budget ? '#f43f5e' : (b.color || '#6366f1'),
                                                }} />
                                            </div>
                                            <div className="flex justify-between mt-1">
                                                <span className="text-[10px]" style={{ color: 'var(--color-text-3)' }}>
                                                    {Math.round(b.usage_percent)}% utilisé
                                                </span>
                                                {b.is_over_budget && <span className="text-[10px] text-rose-500">⚠ Dépassé</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Goals */}
                        <div className="ft-card-static">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="section-title">Objectifs</h2>
                                <Link href="/goals" className="btn-secondary text-xs py-1.5 px-3">Gérer</Link>
                            </div>
                            {goals.length === 0 ? (
                                <div className="text-center py-6">
                                    <p className="text-sm mb-3" style={{ color: 'var(--color-text-3)' }}>Aucun objectif actif</p>
                                    <Link href="/goals" className="btn-secondary text-xs">Créer un objectif</Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {goals.slice(0, 3).map((g) => (
                                        <div key={g.id}>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-xs font-semibold" style={{ color: 'var(--color-text-1)' }}>{g.name}</span>
                                                <span className="text-xs" style={{ color: 'var(--color-text-3)' }}>{Math.round(g.progress)}%</span>
                                            </div>
                                            <div className="progress-bar">
                                                <div className="progress-bar__fill" style={{ width: `${g.progress}%`, backgroundColor: g.color || '#8b5cf6' }} />
                                            </div>
                                            <div className="flex justify-between mt-1">
                                                <span className="text-[10px]" style={{ color: 'var(--color-text-3)' }}>
                                                    {fmt(g.current_amount)} / {fmt(g.target_amount)}
                                                </span>
                                                {g.monthly_saving && (
                                                    <span className="text-[10px] text-violet-500">{fmt(g.monthly_saving)}/mois</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Graphics Section 2: Monthly Trends (6 months) */}
                <div className="ft-card-static h-[400px] flex flex-col">
                    <h2 className="section-title mb-4">Analyse sur 6 mois</h2>
                    <div className="flex-1 min-h-0 w-full text-xs">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={charts.monthly_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: 'var(--color-text-3)', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--color-text-3)', fontSize: 12}} />
                                <RechartsTooltip 
                                    cursor={{ fill: 'var(--color-border)', opacity: 0.4 }}
                                    contentStyle={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', borderRadius: '12px' }}
                                    itemStyle={{ color: 'var(--color-text-1)', fontWeight: 600 }}
                                />
                                <Legend wrapperStyle={{ fontSize: '12px', color: 'var(--color-text-2)' }} />
                                <Bar dataKey="Revenus" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                <Bar dataKey="Dépenses" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Forecast teaser (free plan) */}
                {!plan.has_forecast && (
                    <div className="ft-card-static" style={{ borderColor: 'var(--color-accent)', background: 'color-mix(in srgb, var(--color-accent) 5%, var(--color-bg-card))' }}>
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                                style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 15%, transparent)' }}>
                                📊
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold" style={{ color: 'var(--color-text-1)' }}>Prévisionnel 12 mois</p>
                                <p className="text-sm" style={{ color: 'var(--color-text-3)' }}>Projetez vos finances sur 12 mois avec le plan Premium</p>
                            </div>
                            <Link href="/subscription/upgrade" className="btn-primary shrink-0">Passer Premium</Link>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
