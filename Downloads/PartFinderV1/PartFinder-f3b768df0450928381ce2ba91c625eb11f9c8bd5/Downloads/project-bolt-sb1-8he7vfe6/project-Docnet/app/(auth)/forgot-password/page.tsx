'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotSchema } from '@/lib/validators/auth';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Link from 'next/link';
import { authMock } from '@/lib/mocks/auth';
import { toast } from '@/hooks/use-toast';
import { AuthLayout } from '@/components/ui/AuthLayout';

export default function ForgotPasswordPage() {
	const form = useForm<z.infer<typeof forgotSchema>>({
		resolver: zodResolver(forgotSchema),
		defaultValues: { email: '' },
	});

	async function onSubmit(values: z.infer<typeof forgotSchema>) {
		try {
			const res = await authMock.requestPasswordReset(values);
			toast({ title: 'Solicitud enviada', description: 'Si el email existe, recibirás instrucciones.' });
			toast({ title: 'Enlace temporal (mock)', description: `/reset-password/${res.token}` });
		} catch (err: any) {
			toast({ title: 'Error', description: err?.message ?? 'No se pudo procesar la solicitud' });
		}
	}

	return (
		<AuthLayout title="Recuperar contraseña">
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
					<Button type="submit" disabled={form.formState.isSubmitting} className="w-full bg-red-600 hover:bg-red-700 text-white">
						{form.formState.isSubmitting ? 'Enviando…' : 'Enviar instrucciones'}
					</Button>
				</form>
			</Form>
			<p className="mt-4 text-sm text-gray-300">
				¿Recordaste tu contraseña? <Link className="underline text-red-600" href="/login">Inicia sesión</Link>
			</p>
		</AuthLayout>
	);
}
