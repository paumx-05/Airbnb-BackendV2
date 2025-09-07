export type MockSession = {
	token: string;
	user: { id: string; email: string; name?: string | null };
};

const SESSION_KEY = "mock_session";
const SESSION_EVENT = "mock-session-changed";

export function getSession(): MockSession | null {
	if (typeof window === "undefined") return null;
	try {
		const raw = window.localStorage.getItem(SESSION_KEY);
		return raw ? (JSON.parse(raw) as MockSession) : null;
	} catch {
		return null;
	}
}

function emitSessionChanged() {
	try {
		if (typeof window !== 'undefined') {
			window.dispatchEvent(new Event(SESSION_EVENT));
		}
	} catch {}
}

export function setSession(session: MockSession): void {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
	emitSessionChanged();
}

export function clearSession(): void {
	if (typeof window === "undefined") return;
	window.localStorage.removeItem(SESSION_KEY);
	emitSessionChanged();
}

export const SESSION_CHANGED_EVENT = SESSION_EVENT;
