import { User as AppUser } from '../types';

type MinimalUser = { id: string; email: string } | null;

const LS_USER_KEY = 'auth_current_user';

type AuthListener = (user: MinimalUser) => void;
const listeners = new Set<AuthListener>();

function notify(user: MinimalUser) {
  for (const cb of listeners) cb(user);
}

export const getCurrentUser = async (): Promise<MinimalUser> => {
  const raw = localStorage.getItem(LS_USER_KEY);
  return raw ? (JSON.parse(raw) as MinimalUser) : null;
};

export const onAuthStateChange = (cb: AuthListener) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

export const signIn = async (email: string, _password: string) => {
  const user = { id: 'mock-user-id', email };
  localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
  notify(user);
  return { data: { user }, error: null } as const;
};

export const signUp = async (
  email: string,
  _password: string,
  userData: { name: string; businessName: string; businessType: string; location: string }
) => {
  const user = { id: 'mock-user-id', email };
  localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
  // Optionally store a profile
  const profile: AppUser = {
    id: user.id,
    name: userData.name,
    email,
    businessName: userData.businessName,
    businessType: userData.businessType,
    location: userData.location
  };
  localStorage.setItem(`profile:${user.id}`, JSON.stringify(profile));
  notify(user);
  return { data: { user }, error: null } as const;
};

export const signOut = async () => {
  localStorage.removeItem(LS_USER_KEY);
  notify(null);
  return { error: null } as const;
};

export const getUserProfile = async (userId: string): Promise<any> => {
  const raw = localStorage.getItem(`profile:${userId}`);
  if (raw) return JSON.parse(raw);
  // default profile
  const profile = {
    id: userId,
    email: 'demo@example.com',
    name: 'Demo User',
    business_name: 'Demo Business',
    business_type: 'Technology',
    location: 'Nairobi, Kenya'
  };
  localStorage.setItem(`profile:${userId}`, JSON.stringify(profile));
  return profile;
};


