import { z } from "zod";

export const emailSchema = z.string().email("Email inválido");
export const passwordSchema = z
	.string()
	.min(8, "Mínimo 8 caracteres")
	.regex(/[A-Z]/, "Al menos 1 mayúscula")
	.regex(/[a-z]/, "Al menos 1 minúscula")
	.regex(/[0-9]/, "Al menos 1 número")
	.regex(/[^A-Za-z0-9]/, "Al menos 1 símbolo");

export const registerSchema = z
	.object({
		name: z.string().min(2).optional(),
		email: emailSchema,
		password: passwordSchema,
		confirmPassword: z.string(),
	})
	.refine((d) => d.password === d.confirmPassword, {
		message: "Las contraseñas no coinciden",
		path: ["confirmPassword"],
	});

export const loginSchema = z.object({
	email: emailSchema,
	password: z.string().min(1, "Requerido"),
});

export const forgotSchema = z.object({ email: emailSchema });

export const resetSchema = z
	.object({
		newPassword: passwordSchema,
		confirmPassword: z.string(),
	})
	.refine((d) => d.newPassword === d.confirmPassword, {
		message: "Las contraseñas no coinciden",
		path: ["confirmPassword"],
	});

export const profileSchema = z.object({
	name: z.string().min(2, "Mínimo 2 caracteres").optional().or(z.literal('').transform(() => undefined)),
	email: emailSchema,
});

export const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, "Requerido"),
		newPassword: passwordSchema,
		confirmNewPassword: z.string(),
	})
	.refine((d) => d.newPassword === d.confirmNewPassword, {
		message: "Las contraseñas no coinciden",
		path: ["confirmNewPassword"],
	});
