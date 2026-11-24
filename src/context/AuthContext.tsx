import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, setApiToken } from '../api/client';
import type { Student } from '../types';

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  college: string;
  degree: string;
  department: string;
  rollNumber: string;
  graduationYear: number;
}

interface AuthContextValue {
  student: Student | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<Student>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setStudent: (student: Student | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await api.get<{ token?: string; student: Student }>('/auth/me');
      if (res.data.token) {
        setApiToken(res.data.token);
      }
      setStudent(res.data.student);
    } catch {
      setApiToken(null);
      setStudent(null);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.get<{ token?: string; student: Student }>('/auth/me');
        if (!active) return;
        if (res.data.token) {
          setApiToken(res.data.token);
        }
        setStudent(res.data.student);
      } catch {
        if (!active) return;
        setApiToken(null);
        setStudent(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{ token: string; student: Student }>('/auth/login', {
      email,
      password,
    });
    setApiToken(res.data.token);
    setStudent(res.data.student);
    return res.data.student;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    await api.post('/auth/register', payload);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setApiToken(null);
      setStudent(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        student,
        loading,
        login,
        register,
        logout,
        refreshProfile,
        setStudent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return ctx;
}
