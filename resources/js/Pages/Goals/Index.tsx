import AppLayout from '@/Layouts/AppLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { fmt, currencySymbol } from '@/utils/currency';

interface Goal {
    id: number;
    name: string;
    target_amount: number | string;
    current_amount: number | string;
    target_date?: string;
    status: 'active' | 'completed' | 'paused';
    color: string;
    icon?: string;
    notes?: string;
    progress: number;
    remaining: number;
    monthly_saving?: number | null;
}

interface Props {
    goals: Goal[];
    plan: { slug: string; max_goals: number | null };
    canCreateGoal: boolean;
}

const GOAL_ICONS = ['🎯','✈️','🏠','🚗','💍','📱','🎓','👶','🏖️','🏋️','💻','🎸','🏦','🏝️','🐾'];
const COLORS = ['#3b82f6','#8b5cf6','#10b981','#f43f5e','#f59e0b','#0ea5e9','#ec4899','#14b8a6','#f97316','#a855f7'];


function GoalModal({ open, onClose, goal }: {
    open: boolean; onClose: () => void; goal?: Goal | null;
}) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: goal?.name || '',
        target_amount: goal?.target_amount?.toString() || '',
        current_amount: goal?.current_amount?.toString() || '0',
        target_date: goal?.target_date || '',
        color: goal?.color || '#8b5cf6',
        icon: goal?.icon || '🎯',
        notes: goal?.notes || '',
    });

    if (!open) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (goal) {
            put(`/goals/${goal.id}`, { onSuccess: () => onClose() });
        } else {
            post('/goals', { onSuccess: () => { reset(); onClose(); } });
        }
    };

    return (
        <div className="ft-modal-backdrop animate-fade-in" onClick={onClose}>
            <div className="ft-modal animate-scale-in" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        {goal ? 'Modifier l\'objectif' : 'Nouvel objectif'}
                    </h2>
                    <button onClick={onClose} className="btn-icon">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Icon picker */}
                    <div>
                        <label className="ft-label">Icône</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {GOAL_ICONS.map(ic => (
                                <button key={ic} type="button"
                                    onClick={() => setData('icon', ic)}
                                    className={`h-9 w-9 rounded-lg text-lg transition flex items-center justify-center ${data.icon === ic ? 'bg-blue-500/20 ring-2 ring-blue-500/40' : 'bg-slate-100 dark:bg-slate-800 hover:bg-[#2a4070]'}`}
                                >
                                    {ic}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="ft-label">Nom de l'objectif</label>
                        <input type="text" value={data.name} onChange={e => setData('name', e.target.value)}
                            className="ft-input" placeholder="Ex: Vacances en Italie" required />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="ft-label">Montant cible ({currencySymbol()})</label>
                            <input type="number" step="0.01" min="0.01" value={data.target_amount}
                                onChange={e => setData('target_amount', e.target.value)}
                                className="ft-input" placeholder="2000.00" required />
                        </div>
                        <div>
                            <label className="ft-label">Montant actuel ({currencySymbol()})</label>
                            <input type="number" step="0.01" min="0" value={data.current_amount}
                                onChange={e => setData('current_amount', e.target.value)}
                                className="ft-input" placeholder="0.00" />
                        </div>
                    </div>

                    <div>
                        <label className="ft-label">Date cible (optionnel)</label>
                        <input type="date" value={data.target_date} onChange={e => setData('target_date', e.target.value)}
                            className="ft-input" min={new Date().toISOString().slice(0, 10)} />
                    </div>

                    <div>
                        <label className="ft-label">Couleur</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {COLORS.map(c => (
                                <button key={c} type="button"
                                    onClick={() => setData('color', c)}
                                    className={`h-7 w-7 rounded-full transition-all ${data.color === c ? 'scale-125 ring-2 ring-white/40' : 'hover:scale-110'}`}
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
                            {processing ? 'Enregistrement...' : goal ? 'Modifier' : 'Créer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function DepositModal({ open, onClose, goal }: { open: boolean; onClose: () => void; goal: Goal | null }) {
    const { data, setData, post, processing, reset } = useForm({ amount: '' });

    if (!open || !goal) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/goals/${goal.id}/deposit`, { onSuccess: () => { reset(); onClose(); } });
    };

    return (
        <div className="ft-modal-backdrop animate-fade-in" onClick={onClose}>
            <div className="ft-modal animate-scale-in max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Ajouter un dépôt</h2>
                    <button onClick={onClose} className="btn-icon">✕</button>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Objectif : <span className="text-slate-900 dark:text-white font-medium">{goal.name}</span></p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="ft-label">Montant à déposer ({currencySymbol()})</label>
                        <input type="number" step="0.01" min="0.01" value={data.amount}
                            onChange={e => setData('amount', e.target.value)}
                            className="ft-input" placeholder="100.00" required autoFocus />
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1">Annuler</button>
                        <button type="submit" disabled={processing} className="btn-success flex-1 justify-center">
                            {processing ? '...' : '💰 Déposer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function GoalsIndex({ goals, plan, canCreateGoal }: Props) {
    const [modal, setModal] = useState<'none' | 'create' | 'edit' | 'deposit'>('none');
    const [editGoal, setEditGoal] = useState<Goal | null>(null);
    const [depositGoal, setDepositGoal] = useState<Goal | null>(null);

    const openEdit = (g: Goal) => { setEditGoal(g); setModal('edit'); };
    const openDeposit = (g: Goal) => { setDepositGoal(g); setModal('deposit'); };

    const deleteGoal = (id: number) => {
        if (confirm('Supprimer cet objectif ?')) router.delete(`/goals/${id}`, { preserveScroll: true });
    };

    const completeGoal = (id: number) => {
        router.patch(`/goals/${id}/complete`, {}, { preserveScroll: true });
    };

    const activeGoals = goals.filter(g => g.status === 'active');
    const completedGoals = goals.filter(g => g.status === 'completed');

    return (
        <AppLayout header={
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Objectifs d'épargne</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{activeGoals.length} actif(s) · {completedGoals.length} accompli(s)</p>
                </div>
                {canCreateGoal ? (
                    <button onClick={() => setModal('create')} className="btn-primary">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Nouvel objectif
                    </button>
                ) : (
                    <div className="flex items-center gap-2">
                        <span className="badge-warning badge">Limite atteinte ({plan.max_goals} max)</span>
                    </div>
                )}
            </div>
        }>
            <Head title="Objectifs d'épargne" />

            {goals.length === 0 ? (
                <div className="ft-card-static">
                    <div className="empty-state">
                        <div className="empty-state__icon">🎯</div>
                        <p className="empty-state__title">Aucun objectif défini</p>
                        <p className="empty-state__sub">Définissez vos objectifs d'épargne pour mieux planifier votre avenir financier.</p>
                        <button onClick={() => setModal('create')} className="btn-primary mt-2">Créer un objectif</button>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Active goals */}
                    {activeGoals.length > 0 && (
                        <div>
                            <h2 className="section-title mb-4">Objectifs actifs</h2>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {activeGoals.map(g => (
                                    <GoalCard key={g.id} goal={g}
                                        onEdit={openEdit}
                                        onDeposit={openDeposit}
                                        onDelete={deleteGoal}
                                        onComplete={completeGoal}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Completed */}
                    {completedGoals.length > 0 && (
                        <div>
                            <h2 className="section-title mb-4 flex items-center gap-2">
                                <span>🏆</span> Objectifs accomplis
                            </h2>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {completedGoals.map(g => (
                                    <GoalCard key={g.id} goal={g}
                                        onEdit={openEdit}
                                        onDeposit={openDeposit}
                                        onDelete={deleteGoal}
                                        onComplete={completeGoal}
                                        completed
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <GoalModal open={modal === 'create'} onClose={() => setModal('none')} />
            <GoalModal key={editGoal?.id ?? 0} open={modal === 'edit'} onClose={() => { setModal('none'); setEditGoal(null); }} goal={editGoal} />
            <DepositModal open={modal === 'deposit'} onClose={() => { setModal('none'); setDepositGoal(null); }} goal={depositGoal} />
        </AppLayout>
    );
}

function GoalCard({ goal, onEdit, onDeposit, onDelete, onComplete, completed }: {
    goal: Goal;
    onEdit: (g: Goal) => void;
    onDeposit: (g: Goal) => void;
    onDelete: (id: number) => void;
    onComplete: (id: number) => void;
    completed?: boolean;
}) {

    return (
        <div className={`ft-card group relative overflow-hidden ${completed ? 'opacity-75' : ''}`}>
            {/* Top color accent */}
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ backgroundColor: goal.color }} />

            <div className="flex items-start justify-between mb-4 mt-1">
                <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: goal.color + '20' }}>
                        {goal.icon || '🎯'}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{goal.name}</p>
                        {goal.target_date && (
                            <p className="text-xs text-slate-400 dark:text-slate-500">
                                🗓 {new Date(goal.target_date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                            </p>
                        )}
                    </div>
                </div>
                {completed && <span className="badge bg-emerald-500/15 text-emerald-400">✓ Accompli</span>}
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Progression</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{Math.round(goal.progress)}%</span>
                </div>
                <div className="progress-bar h-2">
                    <div className="progress-bar__fill h-2" style={{ width: `${Math.min(100, goal.progress)}%`, backgroundColor: goal.color }} />
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">{fmt(Number(goal.current_amount))}</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{fmt(Number(goal.target_amount))}</span>
                </div>
            </div>

            {goal.monthly_saving && !completed && (
                <p className="text-xs text-violet-400 mb-3">
                    💡 {fmt(goal.monthly_saving)}/mois recommandé
                </p>
            )}

            {!completed && (
                <div className="flex gap-2">
                    <button onClick={() => onDeposit(goal)} className="btn-success flex-1 justify-center text-xs py-2">
                        💰 Déposer
                    </button>
                    <button onClick={() => onEdit(goal)} className="btn-icon" title="Modifier">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button onClick={() => onDelete(goal.id)} className="btn-icon hover:text-rose-400" title="Supprimer">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            )}
            {completed && (
                <button onClick={() => onDelete(goal.id)} className="btn-secondary w-full justify-center text-xs py-2">
                    Supprimer
                </button>
            )}
        </div>
    );
}
