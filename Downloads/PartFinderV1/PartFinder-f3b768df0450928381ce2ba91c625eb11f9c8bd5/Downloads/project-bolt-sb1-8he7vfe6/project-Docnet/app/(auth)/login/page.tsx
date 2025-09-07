'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/validators/auth';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Link from 'next/link';
import { authMock } from '@/lib/mocks/auth';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/ui/AuthLayout';

export default function LoginPage() {
	const router = useRouter();
	const form = useForm<z.infer<typeof loginSchema>>({
		resolver: zodResolver(loginSchema),
		defaultValues: { email: '', password: '' },
	});

	async function onSubmit(values: z.infer<typeof loginSchema>) {
		try {
			await authMock.login(values);
			toast({ title: 'Bienvenido', description: 'Inicio de sesión exitoso' });
			router.push('/');
		} catch (err: any) {
			toast({ title: 'Error', description: err?.message ?? 'No se pudo iniciar sesión' });
		}
	}

	return (
		<AuthLayout title="Iniciar sesión">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input type="email" placeholder="tu@email.com" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Contraseña</FormLabel>
								<FormControl>
									<Input type="password" placeholder="••••••••" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit" disabled={form.formState.isSubmitting} className="w-full bg-red-600 hover:bg-red-700 text-white">
						{form.formState.isSubmitting ? 'Entrando…' : 'Entrar'}
					</Button>
				</form>
			</Form>
			<p className="mt-4 text-sm text-gray-300">
				¿No tienes cuenta? <Link className="underline text-red-600" href="/register">Regístrate</Link>
			</p>
			<p className="mt-2 text-sm text-gray-300">
				¿Olvidaste tu contraseña? <Link className="underline text-red-600" href="/forgot-password">Recupérala</Link>
			</p>
		</AuthLayout>
	);
}
