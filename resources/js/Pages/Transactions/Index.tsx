import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { fmt, currencySymbol } from '@/utils/currency';

interface Transaction {
    id: number;
    type: 'income' | 'expense';
    amount: string;
    description: string;
    category: string;
    date: string;
    is_recurring: boolean;
    recurring_frequency?: string;
    notes?: string;
    budget?: { id: number; name: string } | null;
}

interface Pagination {
    data: Transaction[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Budget {
    id: number;
    name: string;
    category: string;
}

interface Props {
    transactions: Pagination;
    budgets: Budget[];
    filters: {
        type?: string;
        category?: string;
        month?: number;
        year?: number;
    };
}

const CATEGORIES = [
    'Salaire','Alimentation','Logement','Transport','Santé','Loisirs',
    'Télécom','Éducation','Vêtements','Restauration','Voyages','Épargne',
    'Investissement','Autres',
];


function CategoryIcon({ category }: { category: string }) {
    const map: Record<string, string> = {
        'Salaire': '💼','Alimentation': '🛒','Logement': '🏠','Transport': '🚗',
        'Santé': '🏥','Loisirs': '🎮','Télécom': '📱','Éducation': '📚',
        'Vêtements': '👗','Restauration': '🍽️','Voyages': '✈️','Épargne': '💰',
        'Investissement': '📈','Autres': '💳',
    };
    return <span>{map[category] || '💳'}</span>;
}

function TransactionModal({
    open, onClose, transaction, budgets, onSuccess,
}: {
    open: boolean; onClose: () => void;
    transaction?: Transaction | null;
    budgets: Budget[];
    onSuccess: () => void;
}) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        type: transaction?.type || 'expense',
        amount: transaction?.amount || '',
        description: transaction?.description || '',
        category: transaction?.category || 'Autres',
        date: transaction?.date || new Date().toISOString().slice(0, 10),
        budget_id: transaction?.budget?.id?.toString() || '',
        is_recurring: transaction?.is_recurring || false,
        recurring_frequency: transaction?.recurring_frequency || 'monthly',
        notes: transaction?.notes || '',
    });

    if (!open) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (transaction) {
            put(`/transactions/${transaction.id}`, { onSuccess: () => { onClose(); onSuccess(); } });
        } else {
            post('/transactions', { onSuccess: () => { reset(); onClose(); onSuccess(); } });
        }
    };

    return (
        <div className="ft-modal-backdrop animate-fade-in" onClick={onClose}>
            <div className="ft-modal animate-scale-in w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        {transaction ? 'Modifier la transaction' : 'Nouvelle transaction'}
                    </h2>
                    <button onClick={onClose} className="btn-icon">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Type toggle */}
                    <div>
                        <label className="ft-label">Type</label>
                        <div className="flex gap-2">
                            {(['expense', 'income'] as const).map(t => (
                                <button key={t} type="button"
                                    onClick={() => setData('type', t)}
                                    className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition ${data.type === t
                                        ? t === 'income' ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400' : 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                                        : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}
                                >
                                    {t === 'income' ? '💹 Revenu' : '💸 Dépense'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="ft-label">Montant ({currencySymbol()})</label>
                            <input type="number" step="0.01" min="0.01" value={data.amount}
                                onChange={e => setData('amount', e.target.value)}
                                className="ft-input" placeholder="0.00" required />
                            {errors.amount && <p className="text-xs text-rose-400 mt-1">{errors.amount}</p>}
                        </div>
                        <div>
                            <label className="ft-label">Date</label>
                            <input type="date" value={data.date}
                                onChange={e => setData('date', e.target.value)}
                                className="ft-input" required />
                        </div>
                    </div>

                    <div>
                        <label className="ft-label">Description</label>
                        <input type="text" value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            className="ft-input" placeholder="Ex: Courses Carrefour" required />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="ft-label">Catégorie</label>
                            <select value={data.category} onChange={e => setData('category', e.target.value)} className="ft-select">
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="ft-label">Budget (optionnel)</label>
                            <select value={data.budget_id} onChange={e => setData('budget_id', e.target.value)} className="ft-select">
                                <option value="">— Aucun —</option>
                                {budgets.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={data.is_recurring}
                                onChange={e => setData('is_recurring', e.target.checked)}
                                className="rounded accent-blue-500" />
                            <span className="text-sm text-slate-500 dark:text-slate-400">Transaction récurrente</span>
                        </label>
                    </div>

                    {data.is_recurring && (
                        <div>
                            <label className="ft-label">Fréquence</label>
                            <select value={data.recurring_frequency}
                                onChange={e => setData('recurring_frequency', e.target.value)}
                                className="ft-select">
                                <option value="daily">Quotidien</option>
                                <option value="weekly">Hebdomadaire</option>
                                <option value="monthly">Mensuel</option>
                                <option value="yearly">Annuel</option>
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="ft-label">Notes (optionnel)</label>
                        <textarea value={data.notes} onChange={e => setData('notes', e.target.value)}
                            className="ft-input resize-none" rows={2} placeholder="Informations complémentaires..." />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1">Annuler</button>
                        <button type="submit" disabled={processing} className="btn-primary flex-1 justify-center">
                            {processing ? 'Enregistrement...' : transaction ? 'Modifier' : 'Ajouter'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function TransactionsIndex({ transactions, budgets, filters }: Props) {
    const [modal, setModal] = useState<'none' | 'create' | 'edit'>('none');
    const [editTx, setEditTx] = useState<Transaction | null>(null);

    const [filterType, setFilterType] = useState(filters.type || '');
    const [filterCat, setFilterCat] = useState(filters.category || '');

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const [filterMonth, setFilterMonth] = useState(filters.month || currentMonth);
    const [filterYear, setFilterYear] = useState(filters.year || currentYear);

    const applyFilters = () => {
        router.get('/transactions', {
            type: filterType || undefined,
            category: filterCat || undefined,
            month: filterMonth,
            year: filterYear,
        }, { preserveState: true });
    };

    const resetFilters = () => {
        setFilterType(''); setFilterCat('');
        setFilterMonth(currentMonth); setFilterYear(currentYear);
        router.get('/transactions', {}, { preserveState: false });
    };

    const openEdit = (tx: Transaction) => {
        setEditTx(tx);
        setModal('edit');
    };

    const deleteTransaction = (id: number) => {
        if (confirm('Supprimer cette transaction ?')) {
            router.delete(`/transactions/${id}`, { preserveScroll: true });
        }
    };

    const onSuccess = () => router.reload({ only: ['transactions'] });

    const months = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

    return (
        <AppLayout header={
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Transactions</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{transactions.total} transaction(s) trouvée(s)</p>
                </div>
                <button onClick={() => setModal('create')} className="btn-primary">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Nouvelle transaction
                </button>
            </div>
        }>
            <Head title="Transactions" />

            {/* Filters */}
            <div className="ft-card-static mb-5">
                <div className="flex flex-wrap items-end gap-3">
                    <div>
                        <label className="ft-label">Mois</label>
                        <select value={filterMonth} onChange={e => setFilterMonth(Number(e.target.value))} className="ft-select w-36">
                            {months.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="ft-label">Année</label>
                        <select value={filterYear} onChange={e => setFilterYear(Number(e.target.value))} className="ft-select w-28">
                            {[2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="ft-label">Type</label>
                        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="ft-select w-36">
                            <option value="">Tous</option>
                            <option value="income">Revenus</option>
                            <option value="expense">Dépenses</option>
                        </select>
                    </div>
                    <div>
                        <label className="ft-label">Catégorie</label>
                        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="ft-select w-40">
                            <option value="">Toutes</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={applyFilters} className="btn-primary">Filtrer</button>
                        <button onClick={resetFilters} className="btn-secondary">Réinitialiser</button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="ft-card-static">
                {transactions.data.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state__icon">💳</div>
                        <p className="empty-state__title">Aucune transaction</p>
                        <p className="empty-state__sub">Aucune transaction ne correspond à vos critères de filtre.</p>
                        <button onClick={() => setModal('create')} className="btn-primary mt-2">Ajouter une transaction</button>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="ft-table">
                                <thead>
                                    <tr>
                                        <th>Transaction</th>
                                        <th>Catégorie</th>
                                        <th>Date</th>
                                        <th>Budget</th>
                                        <th className="text-right">Montant</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.data.map(tx => (
                                        <tr key={tx.id}>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-base">
                                                        <CategoryIcon category={tx.category} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900 dark:text-white">{tx.description}</p>
                                                        {tx.is_recurring && (
                                                            <span className="text-[10px] text-slate-400 dark:text-slate-500">🔄 {tx.recurring_frequency}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={tx.type === 'income' ? 'badge-income badge' : 'badge-expense badge'}>
                                                    {tx.category}
                                                </span>
                                            </td>
                                            <td className="text-sm">{new Date(tx.date).toLocaleDateString('fr-FR')}</td>
                                            <td className="text-sm">{tx.budget?.name || '—'}</td>
                                            <td className="text-right">
                                                <span className={`text-sm font-semibold ${tx.type === 'income' ? 'amount-positive' : 'amount-negative'}`}>
                                                    {tx.type === 'income' ? '+' : '-'}{fmt(parseFloat(tx.amount))}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => openEdit(tx)} className="btn-icon" title="Modifier">
                                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button onClick={() => deleteTransaction(tx.id)} className="btn-icon hover:text-rose-400 hover:border-rose-500/30" title="Supprimer">
                                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {transactions.last_page > 1 && (
                            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700 mt-4">
                                <p className="text-xs text-slate-400 dark:text-slate-500">
                                    Page {transactions.current_page} / {transactions.last_page} · {transactions.total} résultats
                                </p>
                                <div className="flex gap-1">
                                    {transactions.links.map((link, i) => (
                                        link.url ? (
                                            <Link key={i} href={link.url}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${link.active
                                                    ? 'bg-blue-600 text-white'
                                                    : 'btn-secondary py-1.5'}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ) : (
                                            <span key={i} className="px-3 py-1.5 rounded-lg text-xs text-slate-400 dark:text-slate-500 opacity-40"
                                                dangerouslySetInnerHTML={{ __html: link.label }} />
                                        )
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modals */}
            <TransactionModal
                open={modal === 'create'}
                onClose={() => setModal('none')}
                budgets={budgets}
                onSuccess={onSuccess}
            />
            <TransactionModal
                key={editTx?.id ?? 0}
                open={modal === 'edit'}
                onClose={() => { setModal('none'); setEditTx(null); }}
                transaction={editTx}
                budgets={budgets}
                onSuccess={onSuccess}
            />
        </AppLayout>
    );
}
