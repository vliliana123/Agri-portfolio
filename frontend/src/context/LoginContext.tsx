import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { checkAuth, loginUser, logoutUser } from '../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

interface LoginContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const LoginContext = createContext<LoginContextType | undefined>(undefined);

export const useLogin = () => {
  const context = useContext(LoginContext);
  if (!context) {
    throw new Error('useLogin must be used inside LoginContextProvider');
  }
  return context;
};

export const LoginContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // La mount: întreabă serverul „sunt logat?"
  // Cookie-ul access_token (httpOnly) e atașat automat de browser.
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const userData = await checkAuth();
        setUser(userData);
        setIsAuthenticated(true);
      } catch {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    verifyAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userData = await loginUser(email, password);
      // Cookies sunt setate de server (httpOnly) — noi păstrăm doar user-ul în state.
      setUser(userData);
      setIsAuthenticated(true);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // Chiar dacă request-ul eșuează (ex: deja delogat),
      // curățăm starea locală oricum.
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <LoginContext.Provider
      value={{ isAuthenticated, user, loading, login, logout }}
    >
      {children}
    </LoginContext.Provider>
  );
};
