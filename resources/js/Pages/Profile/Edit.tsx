import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

interface Props {
    mustVerifyEmail: boolean;
    status?: string;
}

function ProfileInfoForm({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage().props as any;
    const { data, setData, patch, processing, errors } = useForm({
        name:  auth.user?.name  ?? '',
        email: auth.user?.email ?? '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <div className="ft-card-static">
            <div className="mb-6">
                <h2 className="text-base font-bold text-slate-900">Informations personnelles</h2>
                <p className="text-sm text-slate-500 mt-0.5">Modifiez votre nom et votre adresse e-mail.</p>
            </div>
            <form onSubmit={submit} className="space-y-5 max-w-xl">
                <div>
                    <label htmlFor="name" className="ft-label">Nom complet</label>
                    <input id="name" type="text" value={data.name}
                        onChange={e => setData('name', e.target.value)}
                        className="ft-input" autoComplete="name" required />
                    {errors.name && <p className="mt-1.5 text-xs text-rose-600">{errors.name}</p>}
                </div>
                <div>
                    <label htmlFor="email" className="ft-label">Adresse e-mail</label>
                    <input id="email" type="email" value={data.email}
                        onChange={e => setData('email', e.target.value)}
                        className="ft-input" autoComplete="email" required />
                    {errors.email && <p className="mt-1.5 text-xs text-rose-600">{errors.email}</p>}
                </div>
                {mustVerifyEmail && auth.user?.email_verified_at === null && (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
                        Votre adresse e-mail n'est pas vérifiée.
                    </div>
                )}
                <div className="flex items-center gap-4">
                    <button type="submit" disabled={processing} className="btn-primary">
                        {processing ? 'Enregistrement…' : 'Enregistrer'}
                    </button>
                    {status === 'profile-updated' && (
                        <span className="text-sm text-emerald-600 font-medium">✓ Mis à jour !</span>
                    )}
                </div>
            </form>
        </div>
    );
}

function PasswordForm() {
    const { data, setData, put, processing, errors, reset } = useForm({
        current_password:      '',
        password:              '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('password.update'), { onSuccess: () => reset() });
    };

    return (
        <div className="ft-card-static">
            <div className="mb-6">
                <h2 className="text-base font-bold text-slate-900">Changer le mot de passe</h2>
                <p className="text-sm text-slate-500 mt-0.5">Utilisez un mot de passe long et aléatoire pour sécuriser votre compte.</p>
            </div>
            <form onSubmit={submit} className="space-y-5 max-w-xl">
                <div>
                    <label htmlFor="current_password" className="ft-label">Mot de passe actuel</label>
                    <input id="current_password" type="password" value={data.current_password}
                        onChange={e => setData('current_password', e.target.value)}
                        className="ft-input" autoComplete="current-password" required />
                    {errors.current_password && <p className="mt-1.5 text-xs text-rose-600">{errors.current_password}</p>}
                </div>
                <div>
                    <label htmlFor="new_password" className="ft-label">Nouveau mot de passe</label>
                    <input id="new_password" type="password" value={data.password}
                        onChange={e => setData('password', e.target.value)}
                        className="ft-input" autoComplete="new-password" required />
                    {errors.password && <p className="mt-1.5 text-xs text-rose-600">{errors.password}</p>}
                </div>
                <div>
                    <label htmlFor="password_confirmation" className="ft-label">Confirmer le mot de passe</label>
                    <input id="password_confirmation" type="password" value={data.password_confirmation}
                        onChange={e => setData('password_confirmation', e.target.value)}
                        className="ft-input" autoComplete="new-password" required />
                    {errors.password_confirmation && <p className="mt-1.5 text-xs text-rose-600">{errors.password_confirmation}</p>}
                </div>
                <button type="submit" disabled={processing} className="btn-primary">
                    {processing ? 'Mise à jour…' : 'Mettre à jour'}
                </button>
            </form>
        </div>
    );
}

function DeleteAccountForm() {
    const { data, setData, delete: destroy, processing, errors } = useForm({ password: '' });
    const [confirming, setConfirming] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        destroy(route('profile.destroy'), { onSuccess: () => setConfirming(false) });
    };

    return (
        <div className="ft-card-static border-rose-200 bg-rose-50/30">
            <div className="mb-6">
                <h2 className="text-base font-bold text-rose-600">Supprimer le compte</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                    Une fois supprimé, toutes vos données seront définitivement effacées.
                </p>
            </div>
            {!confirming ? (
                <button onClick={() => setConfirming(true)} className="btn-danger">
                    Supprimer mon compte
                </button>
            ) : (
                <form onSubmit={submit} className="space-y-4 max-w-xl">
                    <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
                        ⚠ Cette action est irréversible. Toutes vos transactions, budgets et objectifs seront supprimés.
                    </div>
                    <div>
                        <label htmlFor="del_password" className="ft-label">Confirmez avec votre mot de passe</label>
                        <input id="del_password" type="password" value={data.password}
                            onChange={e => setData('password', e.target.value)}
                            className="ft-input" placeholder="••••••••" autoFocus required />
                        {errors.password && <p className="mt-1.5 text-xs text-rose-600">{errors.password}</p>}
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={() => setConfirming(false)} className="btn-secondary">Annuler</button>
                        <button type="submit" disabled={processing} className="btn-danger">
                            {processing ? 'Suppression…' : 'Confirmer la suppression'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default function Edit({ mustVerifyEmail, status }: Props) {
    const { auth } = usePage().props as any;

    return (
        <AppLayout header={
            <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-lg font-bold text-white shadow">
                    {auth?.user?.name?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Mon profil</h1>
                    <p className="text-sm text-slate-500">{auth?.user?.email}</p>
                </div>
            </div>
        }>
            <Head title="Mon profil" />
            <div className="space-y-6 max-w-2xl">
                <ProfileInfoForm mustVerifyEmail={mustVerifyEmail} status={status} />
                <PasswordForm />
                <DeleteAccountForm />
            </div>
        </AppLayout>
    );
}
