// Auth utilities for LOOP Feedback Platform
// Stores JWT token in localStorage and provides login/logout/register helpers

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface AuthUser {
  id: string;
  email: string;
  role: 'ADMIN' | 'ANALYST' | 'VIEWER';
  workspaceId: string;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('loop_token');
}

export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('loop_user');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function setAuth(token: string, user: AuthUser) {
  localStorage.setItem('loop_token', token);
  localStorage.setItem('loop_user', JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem('loop_token');
  localStorage.removeItem('loop_user');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export async function login(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Login failed');
  }
  const data = await res.json();
  setAuth(data.token, data.user);
  return data;
}

export async function register(email: string, password: string, workspaceName: string): Promise<{ token: string; user: AuthUser }> {
  const res = await fetch(`${API}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, workspaceName }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Registration failed');
  }
  const data = await res.json();
  setAuth(data.token, data.user);
  return data;
}

export function logout() {
  clearAuth();
}
