import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Auth } from './features/auth/Auth';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import { Sidebar } from './components/Sidebar';
import { useUser } from './features/store/useUser';
import Books from './features/books/Books';
import DailyTransactions from './features/dailyRequests/DailyTransactions';
import Dashboard from './features/dashboard/Dashboard';
import Authors from './features/authors/Authors';
import Translators from './features/translators/Translators';
import Publishers from './features/publishers/Publishers';
import UsersPage from './features/users/Users';
import Subjects from './features/subjects/Subjects';

function App() {
  const { user } = useUser();

  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={true}
        theme="light"
      />

      <div className="flex min-h-screen">
        {/* Sidebar */}
        {user && <Sidebar />}

        {/* Main Content */}
        <main className="flex-1 bg-gray-50 overflow-auto">
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={user ? <Navigate to="/dashboard" replace /> : <Auth />}
            />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute><DailyTransactions /></ProtectedRoute>} />
            <Route path="/books" element={<ProtectedRoute><Books /></ProtectedRoute>} />
            <Route path="/authors" element={<ProtectedRoute><Authors /></ProtectedRoute>} />
            <Route path="/translators" element={<ProtectedRoute><Translators /></ProtectedRoute>} />
            <Route path="/publishers" element={<ProtectedRoute><Publishers /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute requireAdmin><UsersPage /></ProtectedRoute>} />
            <Route path="/subjects" element={<ProtectedRoute><Subjects /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;