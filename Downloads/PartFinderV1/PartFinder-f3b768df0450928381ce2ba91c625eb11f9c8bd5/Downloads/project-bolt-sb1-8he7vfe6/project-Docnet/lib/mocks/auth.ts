import { IAuthService, LoginInput, RegisterInput, ResetConfirmInput, ResetRequestInput, UpdateProfileInput, ChangePasswordInput } from "@/lib/services/auth";
import { getSession, setSession, clearSession } from "@/lib/session";

const USERS_KEY = "mock_users";
const TOKENS_KEY = "mock_reset_tokens";

export type MockUser = {
	id: string;
	email: string;
	name?: string | null;
	passwordHash: string; // simple hash mock
};

export type ResetToken = {
	token: string;
	userId: string;
	expiresAt: number; // epoch ms
};

function delay(ms = 400) {
	return new Promise((r) => setTimeout(r, ms));
}

function getId() {
	if (typeof crypto !== "undefined" && typeof (crypto as any).randomUUID === "function") {
		return (crypto as any).randomUUID();
	}
	return Math.random().toString(36).slice(2);
}

function simpleHash(input: string): string {
	let hash = 0;
	for (let i = 0; i < input.length; i++) {
		hash = (hash << 5) - hash + input.charCodeAt(i);
		hash |= 0;
	}
	return `h${Math.abs(hash)}`;
}

function readUsers(): MockUser[] {
	if (typeof window === "undefined") return [];
	const raw = window.localStorage.getItem(USERS_KEY);
	return raw ? (JSON.parse(raw) as MockUser[]) : [];
}

function writeUsers(users: MockUser[]) {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function readTokens(): ResetToken[] {
	if (typeof window === "undefined") return [];
	const raw = window.localStorage.getItem(TOKENS_KEY);
	return raw ? (JSON.parse(raw) as ResetToken[]) : [];
}

function writeTokens(tokens: ResetToken[]) {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
}

function seedDemoUser() {
	const users = readUsers();
	if (users.length === 0) {
		users.push({
			id: getId(),
			email: "demo@docnet.com",
			name: "Demo",
			passwordHash: simpleHash("Demo123!"),
		});
		writeUsers(users);
	}
}

seedDemoUser();

export const authMock: IAuthService = {
	async register(input: RegisterInput) {
		await delay();
		const users = readUsers();
		const exists = users.some((u) => u.email.toLowerCase() === input.email.toLowerCase());
		if (exists) throw new Error("El email ya está registrado");
		const user: MockUser = {
			id: getId(),
			email: input.email,
			name: input.name ?? null,
			passwordHash: simpleHash(input.password),
		};
		users.push(user);
		writeUsers(users);
		return { id: user.id, email: user.email };
	},

	async login(input: LoginInput) {
		await delay();
		const users = readUsers();
		const user = users.find((u) => u.email.toLowerCase() === input.email.toLowerCase());
		if (!user) throw new Error("Credenciales inválidas");
		if (user.passwordHash !== simpleHash(input.password)) throw new Error("Credenciales inválidas");
		const token = getId();
		setSession({ token, user: { id: user.id, email: user.email, name: user.name ?? null } });
		return { token, user: { id: user.id, email: user.email, name: user.name ?? null } };
	},

	async requestPasswordReset(input: ResetRequestInput) {
		await delay();
		const users = readUsers();
		const user = users.find((u) => u.email.toLowerCase() === input.email.toLowerCase());
		const tokens = readTokens();
		if (user) {
			const token = getId();
			const expiresAt = Date.now() + 60 * 60 * 1000; // +1h
			tokens.push({ token, userId: user.id, expiresAt });
			writeTokens(tokens);
			return { ok: true, token };
		}
		return { ok: true, token: getId() };
	},

	async confirmPasswordReset(input: ResetConfirmInput) {
		await delay();
		const tokens = readTokens();
		const tokenEntry = tokens.find((t) => t.token === input.token);
		if (!tokenEntry || tokenEntry.expiresAt < Date.now()) {
			throw new Error("Token inválido o expirado");
		}
		const users = readUsers();
		const user = users.find((u) => u.id === tokenEntry.userId);
		if (!user) throw new Error("Usuario no encontrado");
		user.passwordHash = simpleHash(input.newPassword);
		writeUsers(users);
		writeTokens(tokens.filter((t) => t.token !== input.token));
		return { ok: true };
	},

	async me() {
		await delay(150);
		const session = getSession();
		return session?.user ?? null;
	},

	async logout() {
		await delay(150);
		clearSession();
	},

	async updateProfile(input: UpdateProfileInput) {
		await delay();
		const session = getSession();
		if (!session) throw new Error("No autenticado");
		const users = readUsers();
		const user = users.find((u) => u.id === session.user.id);
		if (!user) throw new Error("Usuario no encontrado");
		if (input.email && input.email.toLowerCase() !== user.email.toLowerCase()) {
			const exists = users.some((u) => u.email.toLowerCase() === input.email!.toLowerCase());
			if (exists) throw new Error("El email ya está en uso");
			user.email = input.email!;
		}
		if (typeof input.name !== 'undefined') {
			user.name = input.name ?? null;
		}
		writeUsers(users);
		const newUser = { id: user.id, email: user.email, name: user.name ?? null };
		setSession({ token: session.token, user: newUser });
		return newUser;
	},

	async changePassword(input: ChangePasswordInput) {
		await delay();
		const session = getSession();
		if (!session) throw new Error("No autenticado");
		const users = readUsers();
		const user = users.find((u) => u.id === session.user.id);
		if (!user) throw new Error("Usuario no encontrado");
		if (user.passwordHash !== simpleHash(input.currentPassword)) {
			throw new Error("Contraseña actual incorrecta");
		}
		user.passwordHash = simpleHash(input.newPassword);
		writeUsers(users);
		return { ok: true };
	},

	async deleteAccount() {
		await delay();
		const session = getSession();
		if (!session) return { ok: true };
		let users = readUsers();
		users = users.filter((u) => u.id !== session.user.id);
		writeUsers(users);
		clearSession();
		return { ok: true };
	},
};
