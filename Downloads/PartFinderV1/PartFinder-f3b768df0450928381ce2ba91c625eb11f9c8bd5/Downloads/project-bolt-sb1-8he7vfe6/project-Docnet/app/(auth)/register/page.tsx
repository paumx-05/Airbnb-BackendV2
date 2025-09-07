'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '@/lib/validators/auth';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Link from 'next/link';
import { authMock } from '@/lib/mocks/auth';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/ui/AuthLayout';

export default function RegisterPage() {
	const router = useRouter();
	const form = useForm<z.infer<typeof registerSchema>>({
		resolver: zodResolver(registerSchema),
		defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
	});

	async function onSubmit(values: z.infer<typeof registerSchema>) {
		try {
			await authMock.register({ name: values.name, email: values.email, password: values.password });
			toast({ title: '¡Listo!', description: 'Cuenta creada correctamente' });
			router.push('/login');
		} catch (err: any) {
			toast({ title: 'Error', description: err?.message ?? 'No se pudo registrar' });
		}
	}

	return (
		<AuthLayout title="Crear cuenta">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Nombre</FormLabel>
								<FormControl>
									<Input placeholder="Tu nombre" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
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
					<FormField
						control={form.control}
						name="confirmPassword"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Confirmar contraseña</FormLabel>
								<FormControl>
									<Input type="password" placeholder="••••••••" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit" disabled={form.formState.isSubmitting} className="w-full bg-red-600 hover:bg-red-700 text-white">
						{form.formState.isSubmitting ? 'Creando…' : 'Crear cuenta'}
					</Button>
				</form>
			</Form>
			<p className="mt-4 text-sm text-gray-300">
				¿Ya tienes cuenta? <Link className="underline text-red-600" href="/login">Inicia sesión</Link>
			</p>
		</AuthLayout>
	);
}
