'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetSchema } from '@/lib/validators/auth';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Link from 'next/link';
import { authMock } from '@/lib/mocks/auth';
import { toast } from '@/hooks/use-toast';
import { useParams, useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/ui/AuthLayout';

interface ResetPasswordClientProps {
  token: string;
}

export default function ResetPasswordClient({ token }: ResetPasswordClientProps) {
	const router = useRouter();
	const form = useForm<z.infer<typeof resetSchema>>({
		resolver: zodResolver(resetSchema),
		defaultValues: { newPassword: '', confirmPassword: '' },
	});

	async function onSubmit(values: z.infer<typeof resetSchema>) {
		try {
			await authMock.confirmPasswordReset({ token, newPassword: values.newPassword });
			toast({ title: 'Contraseña actualizada', description: 'Ya puedes iniciar sesión con tu nueva contraseña.' });
			router.push('/login');
		} catch (err: any) {
			toast({ title: 'Error', description: err?.message ?? 'No se pudo restablecer la contraseña' });
		}
	}

	return (
		<AuthLayout title="Restablecer contraseña">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
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
						{form.formState.isSubmitting ? 'Guardando…' : 'Guardar nueva contraseña'}
					</Button>
				</form>
			</Form>
			<p className="mt-4 text-sm text-gray-300">
				¿Recordaste tu contraseña? <Link className="underline text-red-600" href="/login">Inicia sesión</Link>
			</p>
		</AuthLayout>
	);
}
