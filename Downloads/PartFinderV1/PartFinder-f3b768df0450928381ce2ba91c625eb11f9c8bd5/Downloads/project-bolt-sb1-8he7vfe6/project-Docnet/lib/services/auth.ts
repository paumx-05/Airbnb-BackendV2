export type RegisterInput = { name?: string; email: string; password: string };
export type LoginInput = { email: string; password: string };
export type ResetRequestInput = { email: string };
export type ResetConfirmInput = { token: string; newPassword: string };

export type UpdateProfileInput = { name?: string | null; email?: string };
export type ChangePasswordInput = { currentPassword: string; newPassword: string };

export interface IAuthService {
	register(input: RegisterInput): Promise<{ id: string; email: string }>;
	login(input: LoginInput): Promise<{ token: string; user: { id: string; email: string; name?: string | null } }>;
	requestPasswordReset(input: ResetRequestInput): Promise<{ ok: true; token: string }>;
	confirmPasswordReset(input: ResetConfirmInput): Promise<{ ok: true }>;
	me(): Promise<{ id: string; email: string; name?: string | null } | null>;
	logout(): Promise<void>;
	updateProfile(input: UpdateProfileInput): Promise<{ id: string; email: string; name?: string | null }>;
	changePassword(input: ChangePasswordInput): Promise<{ ok: true }>;
	deleteAccount(): Promise<{ ok: true }>;
}
