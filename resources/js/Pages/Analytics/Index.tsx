import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import { fmt } from '@/utils/currency';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

interface HighestDay {
    day: string | null;
    amount: number;
}

interface Stats {
    income: number;
    expense: number;
    net: number;
    highestDay: HighestDay;
}

interface PieData {
    name: string;
    value: number;
    color: string;
}

interface DailyData {
    day: number;
    date: string;
    expenses: number;
}

interface Props {
    month: number;
    year: number;
    monthLabel: string;
    stats: Stats;
    chartPie: PieData[];
    chartDaily: DailyData[];
}

export default function AnalyticsIndex({ month, year, monthLabel, stats, chartPie, chartDaily }: Props) {
    const [currentWeekIndex, setCurrentWeekIndex] = useState(0);

    // Découper les jours en semaines (tous les 7 jours)
    const weeks: DailyData[][] = [];
    for (let i = 0; i < chartDaily.length; i += 7) {
        weeks.push(chartDaily.slice(i, i + 7));
    }

    const currentWeekData = weeks[currentWeekIndex] || [];
    
    const maxWeeklyExpense = Math.max(
        ...weeks.flatMap(week => week.map(d => d.expenses)),
        1
    );

    const changeMonth = (offset: number) => {
        let newMonth = month + offset;
        let newYear = year;
        
        if (newMonth > 12) {
            newMonth = 1;
            newYear += 1;
        } else if (newMonth < 1) {
            newMonth = 12;
            newYear -= 1;
        }

        router.get('/analytics', { month: newMonth, year: newYear }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    return (
        <AppLayout header={
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-1)' }}>Analyses</h1>
                    <p className="text-sm" style={{ color: 'var(--color-text-3)' }}>Radiographie de vos finances</p>
                </div>
                
                {/* Sélecteur de mois */}
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1" style={{ backgroundColor: 'var(--color-bg-card)' }}>
                    <button 
                        onClick={() => changeMonth(-1)}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition"
                    >
                        <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <span className="w-32 text-center font-medium capitalize" style={{ color: 'var(--color-text-1)' }}>
                        {monthLabel}
                    </span>
                    <button 
                        onClick={() => changeMonth(1)}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition"
                        disabled={month === new Date().getMonth() + 1 && year === new Date().getFullYear()}
                    >
                        <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>
        }>
            <Head title="Analyses" />

            <div className="space-y-6">
                
                {/* Stats principales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="ft-card-static">
                        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-2)' }}>Bilan du mois</p>
                        <p className="text-2xl font-bold" style={{ color: stats.net >= 0 ? '#10b981' : '#f43f5e' }}>{stats.net >= 0 ? '+' : ''}{fmt(stats.net)}</p>
                        <div className="flex gap-4 mt-2 text-xs" style={{ color: 'var(--color-text-3)' }}>
                            <span className="text-emerald-500">Rev: {fmt(stats.income)}</span>
                            <span className="text-rose-500">Dép: {fmt(stats.expense)}</span>
                        </div>
                    </div>
                    
                    <div className="ft-card-static flex flex-col justify-center">
                        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-2)' }}>État</p>
                        {stats.net >= 0 ? (
                            <div className="inline-flex items-center gap-2">
                                <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-sm font-bold">✅ Bénéficiaire</span>
                                <span className="text-xs" style={{ color: 'var(--color-text-3)' }}>Vous avez économisé !</span>
                            </div>
                        ) : (
                            <div className="inline-flex items-center gap-2">
                                <span className="bg-rose-500/10 text-rose-500 px-3 py-1 rounded-full text-sm font-bold">⚠️ Déficitaire</span>
                                <span className="text-xs" style={{ color: 'var(--color-text-3)' }}>Vous avez trop dépensé</span>
                            </div>
                        )}
                    </div>

                    <div className="ft-card-static bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
                        <p className="text-sm font-semibold mb-1 text-amber-500">Journée la plus coûteuse</p>
                        {stats.highestDay.day ? (
                            <>
                                <p className="text-xl font-bold text-amber-500">{fmt(stats.highestDay.amount)}</p>
                                <p className="text-xs mt-1" style={{ color: 'var(--color-text-3)' }}>Le {new Date(stats.highestDay.day).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                            </>
                        ) : (
                            <p className="text-xs mt-2" style={{ color: 'var(--color-text-3)' }}>Aucune dépense</p>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Diagramme circulaire (Catégories) */}
                    <div className="ft-card-static flex flex-col h-[450px]">
                        <h2 className="section-title mb-4">Répartition des dépenses</h2>
                        {chartPie.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-sm" style={{ color: 'var(--color-text-3)' }}>
                                Aucune dépense ce mois-ci
                            </div>
                        ) : (
                            <div className="flex-1 min-h-0 w-full relative flex flex-col">
                                <div className="h-[200px] w-full shrink-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={chartPie}
                                                cx="50%" cy="50%"
                                                innerRadius={60} outerRadius={80}
                                                paddingAngle={2}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {chartPie.map((entry, index) => (
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
                                    {chartPie.map((c, i) => (
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

                    {/* Diagramme hebdomadaire */}
                    <div className="lg:col-span-2 ft-card-static flex flex-col h-[450px]">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="section-title">Vue Hebdomadaire</h2>
                            
                            {/* Pagination des semaines */}
                            {weeks.length > 0 && (
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => setCurrentWeekIndex(i => Math.max(0, i - 1))}
                                        disabled={currentWeekIndex === 0}
                                        className="text-xs px-3 py-1.5 rounded-md border disabled:opacity-30 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                                        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-2)' }}
                                    >
                                        &larr; Précédente
                                    </button>
                                    <span className="text-xs font-semibold" style={{ color: 'var(--color-text-1)' }}>Semaine {currentWeekIndex + 1}</span>
                                    <button 
                                        onClick={() => setCurrentWeekIndex(i => Math.min(weeks.length - 1, i + 1))}
                                        disabled={currentWeekIndex === weeks.length - 1}
                                        className="text-xs px-3 py-1.5 rounded-md border disabled:opacity-30 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                                        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-2)' }}
                                    >
                                        Suivante &rarr;
                                    </button>
                                </div>
                            )}
                        </div>

                        {weeks.length > 0 ? (
                            <div className="flex-1 min-h-0 w-full text-xs">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={currentWeekData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                        <XAxis 
                                            dataKey="date" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{fill: 'var(--color-text-3)', fontSize: 12}} 
                                            tickFormatter={(dateStr) => {
                                                const d = new Date(dateStr);
                                                return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
                                            }}
                                        />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--color-text-3)', fontSize: 12}} domain={[0, maxWeeklyExpense * 1.1]} />
                                        <RechartsTooltip 
                                            cursor={{ fill: 'var(--color-border)', opacity: 0.4 }}
                                            contentStyle={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', borderRadius: '12px' }}
                                            itemStyle={{ color: 'var(--color-text-1)', fontWeight: 600 }}
                                            labelFormatter={(label) => new Date(label).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                        />
                                        <Bar dataKey="expenses" fill="#f43f5e" name="Dépenses" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-sm" style={{ color: 'var(--color-text-3)' }}>
                                Aucune donnée pour ce mois
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
