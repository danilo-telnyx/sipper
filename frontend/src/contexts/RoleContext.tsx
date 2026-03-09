/**
 * Role Context - Admin vs Learner Isolation
 * Manages role selection and ensures complete isolation between personas
 */
import React, { createContext, useContext, useState, ReactNode } from 'react';

// ========================================
// TYPE DEFINITIONS
// ========================================

export type Role = 'admin' | 'learner' | null;

interface RoleContextValue {
  role: Role;
  isAuthenticated: boolean;
  setRole: (role: Role) => void;
  authenticateAdmin: (pin: string) => boolean;
  logout: () => void;
}

// Default admin PIN
const DEFAULT_ADMIN_PIN = 'SIPPER-ADMIN';

// ========================================
// CONTEXT
// ========================================

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

// ========================================
// PROVIDER
// ========================================

interface RoleProviderProps {
  children: ReactNode;
}

export function RoleProvider({ children }: RoleProviderProps) {
  const [role, setRoleState] = useState<Role>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    if (newRole === 'learner') {
      // Learner mode doesn't require authentication
      setIsAuthenticated(true);
    } else if (newRole === null) {
      setIsAuthenticated(false);
    }
  };

  const authenticateAdmin = (pin: string): boolean => {
    // In production, this should check against a secure backend
    // For now, using the default PIN
    const isValid = pin === DEFAULT_ADMIN_PIN;
    
    if (isValid) {
      setRoleState('admin');
      setIsAuthenticated(true);
    }
    
    return isValid;
  };

  const logout = () => {
    setRoleState(null);
    setIsAuthenticated(false);
  };

  const value: RoleContextValue = {
    role,
    isAuthenticated,
    setRole,
    authenticateAdmin,
    logout,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

// ========================================
// HOOK
// ========================================

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
