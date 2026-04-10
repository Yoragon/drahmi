import AppLayout from '@/Layouts/AppLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { fmt, currencySymbol } from '@/utils/currency';

interface Budget {
    id: number;
    name: string;
    category: string;
    monthly_limit: number | string;
    month: number;
    year: number;
    color: string;
    notes?: string;
    spent: number;
    remaining: number;
    usage_percent: number;
    is_over_budget: boolean;
}

interface Props {
    budgets: Budget[];
    currentMonth: number;
    currentYear: number;
}

const CATEGORIES = [
    'Salaire','Alimentation','Logement','Transport','Santé','Loisirs',
    'Télécom','Éducation','Vêtements','Restauration','Voyages','Épargne',
    'Investissement','Autres',
];

const COLORS = [
    '#3b82f6','#8b5cf6','#10b981','#f43f5e','#f59e0b','#0ea5e9',
    '#ec4899','#14b8a6','#f97316','#a855f7',
];


const months = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

function BudgetModal({ open, onClose, budget, currentMonth, currentYear }: {
    open: boolean; onClose: () => void;
    budget?: Budget | null;
    currentMonth: number;
    currentYear: number;
}) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: budget?.name || '',
        category: budget?.category || 'Alimentation',
        monthly_limit: budget?.monthly_limit?.toString() || '',
        month: budget?.month || currentMonth,
        year: budget?.year || currentYear,
        color: budget?.color || '#3b82f6',
        notes: budget?.notes || '',
    });

    if (!open) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (budget) {
            put(`/budgets/${budget.id}`, { onSuccess: () => onClose() });
        } else {
            post('/budgets', { onSuccess: () => { reset(); onClose(); } });
        }
    };

    return (
        <div className="ft-modal-backdrop animate-fade-in" onClick={onClose}>
            <div className="ft-modal animate-scale-in" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        {budget ? 'Modifier le budget' : 'Nouveau budget'}
                    </h2>
                    <button onClick={onClose} className="btn-icon">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="ft-label">Nom du budget</label>
                        <input type="text" value={data.name} onChange={e => setData('name', e.target.value)}
                            className="ft-input" placeholder="Ex: Courses alimentaires" required />
                        {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="ft-label">Catégorie</label>
                            <select value={data.category} onChange={e => setData('category', e.target.value)} className="ft-select">
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="ft-label">Limite mensuelle ({currencySymbol()})</label>
                            <input type="number" step="0.01" min="0.01" value={data.monthly_limit}
                                onChange={e => setData('monthly_limit', e.target.value)}
                                className="ft-input" placeholder="500.00" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="ft-label">Mois</label>
                            <select value={data.month} onChange={e => setData('month', Number(e.target.value))} className="ft-select">
                                {months.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="ft-label">Année</label>
                            <select value={data.year} onChange={e => setData('year', Number(e.target.value))} className="ft-select">
                                {[2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="ft-label">Couleur</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {COLORS.map(c => (
                                <button key={c} type="button"
                                    onClick={() => setData('color', c)}
                                    className={`h-7 w-7 rounded-full transition-all ${data.color === c ? 'scale-125 ring-2 ring-white/50' : 'hover:scale-110'}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="ft-label">Notes (optionnel)</label>
                        <textarea value={data.notes} onChange={e => setData('notes', e.target.value)}
                            className="ft-input resize-none" rows={2} />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1">Annuler</button>
                        <button type="submit" disabled={processing} className="btn-primary flex-1 justify-center">
                            {processing ? 'Enregistrement...' : budget ? 'Modifier' : 'Créer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function BudgetsIndex({ budgets, currentMonth, currentYear }: Props) {
    const [modal, setModal] = useState<'none' | 'create' | 'edit'>('none');
    const [editBudget, setEditBudget] = useState<Budget | null>(null);

    const openEdit = (b: Budget) => { setEditBudget(b); setModal('edit'); };

    const deleteBudget = (id: number) => {
        if (confirm('Supprimer ce budget ? Les transactions liées ne seront pas supprimées.')) {
            router.delete(`/budgets/${id}`, { preserveScroll: true });
        }
    };

    const totalLimit = budgets.reduce((s, b) => s + Number(b.monthly_limit), 0);
    const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
    const overBudgetCount = budgets.filter(b => b.is_over_budget).length;

    return (
        <AppLayout header={
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Budgets</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{months[currentMonth - 1]} {currentYear}</p>
                </div>
                <button onClick={() => setModal('create')} className="btn-primary">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Nouveau budget
                </button>
            </div>
        }>
            <Head title="Budgets" />

            {/* Summary */}
            {budgets.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="stat-card">
                        <div className="stat-card__icon bg-blue-500/10">
                            <span className="text-xl text-blue-400">💼</span>
                        </div>
                        <div>
                            <p className="stat-card__label">Total budgeté</p>
                            <p className="stat-card__value">{fmt(totalLimit)}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card__icon bg-rose-500/10">
                            <span className="text-xl text-rose-400">💸</span>
                        </div>
                        <div>
                            <p className="stat-card__label">Total dépensé</p>
                            <p className="stat-card__value">{fmt(totalSpent)}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className={`stat-card__icon ${overBudgetCount > 0 ? 'bg-amber-500/10' : 'bg-emerald-500/10'}`}>
                            <span className="text-xl">{overBudgetCount > 0 ? '⚠️' : '✅'}</span>
                        </div>
                        <div>
                            <p className="stat-card__label">Dépassements</p>
                            <p className={`stat-card__value ${overBudgetCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                {overBudgetCount} budget{overBudgetCount !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Budget cards */}
            {budgets.length === 0 ? (
                <div className="ft-card-static">
                    <div className="empty-state">
                        <div className="empty-state__icon">📊</div>
                        <p className="empty-state__title">Aucun budget ce mois-ci</p>
                        <p className="empty-state__sub">Créez vos premiers budgets pour suivre vos dépenses par catégorie.</p>
                        <button onClick={() => setModal('create')} className="btn-primary mt-2">Créer un budget</button>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {budgets.map(b => (
                        <div key={b.id} className="ft-card group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: b.color + '20' }}>
                                        <span style={{ color: b.color }}>💼</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{b.name}</p>
                                        <span className="badge-muted badge text-xs">{b.category}</span>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                    <button onClick={() => openEdit(b)} className="btn-icon" title="Modifier">
                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button onClick={() => deleteBudget(b.id)} className="btn-icon hover:text-rose-400" title="Supprimer">
                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500 dark:text-slate-400">Dépensé</span>
                                    <span className={`font-semibold ${b.is_over_budget ? 'text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                                        {fmt(b.spent)} / {fmt(Number(b.monthly_limit))}
                                    </span>
                                </div>

                                <div className="progress-bar">
                                    <div
                                        className="progress-bar__fill"
                                        style={{
                                            width: `${Math.min(100, b.usage_percent)}%`,
                                            backgroundColor: b.is_over_budget ? '#f43f5e' : b.color,
                                        }}
                                    />
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-slate-400 dark:text-slate-500">{Math.round(b.usage_percent)}% utilisé</span>
                                    {b.is_over_budget ? (
                                        <span className="badge-expense badge">⚠ Dépassé de {fmt(Math.abs(b.remaining))}</span>
                                    ) : (
                                        <span className="text-xs text-emerald-400">{fmt(b.remaining)} restant</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <BudgetModal
                open={modal === 'create'}
                onClose={() => setModal('none')}
                currentMonth={currentMonth}
                currentYear={currentYear}
            />
            <BudgetModal
                key={editBudget?.id ?? 0}
                open={modal === 'edit'}
                onClose={() => { setModal('none'); setEditBudget(null); }}
                budget={editBudget}
                currentMonth={currentMonth}
                currentYear={currentYear}
            />
        </AppLayout>
    );
}
