'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSession, clearSession, SESSION_CHANGED_EVENT } from '@/lib/session';
import { authMock } from '@/lib/mocks/auth';

export function useSessionMock() {
	const [sessionUser, setSessionUser] = useState(getSession()?.user ?? null);

	const refresh = useCallback(() => {
		setSessionUser(getSession()?.user ?? null);
	}, []);

	useEffect(() => {
		const onStorage = (e: StorageEvent) => {
			if (e.key === 'mock_session') {
				refresh();
			}
		};
		const onCustom = () => refresh();
		window.addEventListener('storage', onStorage);
		window.addEventListener(SESSION_CHANGED_EVENT, onCustom as EventListener);
		return () => {
			window.removeEventListener('storage', onStorage);
			window.removeEventListener(SESSION_CHANGED_EVENT, onCustom as EventListener);
		};
	}, [refresh]);

	const logout = useCallback(async () => {
		await authMock.logout();
		clearSession();
		refresh();
	}, [refresh]);

	return {
		user: sessionUser,
		isAuthenticated: !!sessionUser,
		refresh,
		logout,
	};
}
