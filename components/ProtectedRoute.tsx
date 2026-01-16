
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
    // Si el usuario no está autenticado, redirige a la página de login
    return <Navigate to="/login" />;
  }

  if (role && allowedRoles.includes(role)) {
    // Si el usuario tiene un rol y está en la lista de roles permitidos, muestra el contenido
    return children;
  } else {
    // Si el rol del usuario no está permitido, redirige a una página principal o de "no autorizado"
    // Por simplicidad, lo redirigimos a la home, pero podría ser a /login o a una página de error.
    return <Navigate to="/" />;
  }
};
