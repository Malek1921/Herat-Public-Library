import { Navigate } from 'react-router-dom';
import { useUser } from '../../store/useUser';

export function ProtectedRoute({ children, requireAdmin = false }) {
    const { user, token } = useUser();

    if (!user || !token) {
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && user.role !== 'admin') {
        return <Navigate to="/login" replace />;
    }

    return children;
}