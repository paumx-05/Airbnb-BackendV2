'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionMock } from '@/hooks/use-session-mock';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, changePasswordSchema } from '@/lib/validators/auth';
import { z } from 'zod';
import { authMock } from '@/lib/mocks/auth';
import { toast } from '@/hooks/use-toast';
import { AuthLayout } from '@/components/ui/AuthLayout';

export default function AccountPage() {
	const router = useRouter();
	const { user, isAuthenticated, refresh, logout } = useSessionMock();

	useEffect(() => {
		if (!isAuthenticated) {
			router.replace('/login');
		}
	}, [isAuthenticated, router]);

	const formProfile = useForm<z.infer<typeof profileSchema>>({
		resolver: zodResolver(profileSchema),
		defaultValues: { name: user?.name ?? '', email: user?.email ?? '' },
		values: { name: user?.name ?? '', email: user?.email ?? '' },
	});

	const formPassword = useForm<z.infer<typeof changePasswordSchema>>({
		resolver: zodResolver(changePasswordSchema),
		defaultValues: { currentPassword: '', newPassword: '', confirmNewPassword: '' },
	});

	async function onSubmitProfile(values: z.infer<typeof profileSchema>) {
		try {
			await authMock.updateProfile({ name: values.name, email: values.email });
			refresh();
			toast({ title: 'Perfil actualizado' });
		} catch (err: any) {
			toast({ title: 'Error', description: err?.message ?? 'No se pudo actualizar el perfil' });
		}
	}

	async function onSubmitPassword(values: z.infer<typeof changePasswordSchema>) {
		try {
			await authMock.changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword });
			formPassword.reset();
			toast({ title: 'Contraseña cambiada' });
		} catch (err: any) {
			toast({ title: 'Error', description: err?.message ?? 'No se pudo cambiar la contraseña' });
		}
	}

	async function handleDeleteAccount() {
		try {
			await authMock.deleteAccount();
			toast({ title: 'Cuenta eliminada' });
			router.replace('/');
		} catch (err: any) {
			toast({ title: 'Error', description: err?.message ?? 'No se pudo eliminar la cuenta' });
		}
	}

	return (
		<AuthLayout title="Mi cuenta" cardClassName="max-w-2xl">
			<div className="space-y-10">
				<section>
					<h2 className="mb-4 text-lg font-medium">Perfil</h2>
					<div className="flex flex-col lg:flex-row gap-6">
						<div className="flex flex-col items-center">
							<div className="h-24 w-24 rounded-full bg-gray-700 flex items-center justify-center text-2xl font-bold text-white">
								{user?.name ? user.name.charAt(0).toUpperCase() : user?.email.charAt(0).toUpperCase()}
							</div>
							<Button className="mt-4 bg-red-600 hover:bg-red-700 text-white" onClick={() => toast({ title: 'Mock', description: 'Funcionalidad de cambiar avatar (mock)' })}>
								Cambiar avatar
							</Button>
							<h3 className="mt-4 text-xl font-bold text-white">{user?.name || user?.email}</h3>
						</div>
						<div className="flex-1">
							<Form {...formProfile}>
								<form onSubmit={formProfile.handleSubmit(onSubmitProfile)} className="space-y-4">
									<FormField control={formProfile.control} name="name" render={({ field }) => (
										<FormItem>
											<FormLabel>Nombre</FormLabel>
											<FormControl>
												<Input placeholder="Tu nombre" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)} />
									<FormField control={formProfile.control} name="email" render={({ field }) => (
										<FormItem>
											<FormLabel>Email</FormLabel>
											<FormControl>
												<Input type="email" placeholder="tu@email.com" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)} />
									<Button type="submit" disabled={formProfile.formState.isSubmitting} className="bg-red-600 hover:bg-red-700 text-white">
										Guardar cambios
									</Button>
								</form>
							</Form>
						</div>
					</div>
				</section>

				<section>
					<h2 className="mb-4 text-lg font-medium">Cambiar contraseña</h2>
					<Form {...formPassword}>
						<form onSubmit={formPassword.handleSubmit(onSubmitPassword)} className="space-y-4">
							<FormField
								control={formPassword.control}
								name="currentPassword"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Contraseña actual</FormLabel>
										<FormControl>
											<Input type="password" placeholder="••••••••" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={formPassword.control}
								name="newPassword"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Nueva contraseña</FormLabel>
										<FormControl>
											<Input type="password" placeholder="••••••••" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={formPassword.control}
								name="confirmNewPassword"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Confirmar nueva contraseña</FormLabel>
										<FormControl>
											<Input type="password" placeholder="••••••••" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button type="submit" disabled={formPassword.formState.isSubmitting}>Cambiar contraseña</Button>
						</form>
					</Form>
				</section>

				<section>
					<h2 className="mb-2 text-lg font-medium">Sesión</h2>
					<div className="flex items-center gap-2">
						<Button variant="outline" onClick={() => router.push('/')}>Ir al inicio</Button>
						<Button variant="destructive" onClick={async () => { await logout(); router.replace('/login'); }}>Salir</Button>
						<Button variant="ghost" onClick={handleDeleteAccount}>Eliminar cuenta</Button>
					</div>
				</section>
			</div>
		</AuthLayout>
	);
}
