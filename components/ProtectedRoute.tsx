
import React from 'react';
import { Navigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  user: User | null;
  role: UserRole | null;
  allowedRoles: UserRole[];
  children: React.ReactElement;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ user, role, allowedRoles, children }) => {
  if (!user) {
    // Si no hay usuario, redirigir a la página de login
    return <Navigate to="/login" replace />;
  }

  if (role && allowedRoles.includes(role)) {
    // Si el usuario tiene el rol permitido, renderizar el componente hijo (el dashboard)
    return children;
  }
  
  // Si el usuario está logueado pero no tiene el rol correcto, redirigir a la página de inicio
  // Esto evita que un 'vendor' acceda al dashboard de 'superadmin', por ejemplo.
  return <Navigate to="/" replace />;
};
