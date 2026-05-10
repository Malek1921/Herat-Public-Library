import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Auth } from './features/auth/Auth';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { useUser } from './features/store/useUser';
import { Login } from './features/auth/components/Login';
import { Books } from './features/books/Books';
import DailyTransactions from './features/dailyRequests/DailyTransactions';

// Placeholder components (we'll build these next)
function Dashboard() {
  return <div className="p-6"><Login /></div>;
}




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

      {user && <Navbar />}

      <main className={user ? 'bg-gray-50 min-h-[calc(100vh-64px)]' : ''}>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" replace /> : <Auth />}
          />

          {/* Protected Routes */}
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <DailyTransactions />
              </ProtectedRoute>
            }
          />

          <Route
            path="/books"
            element={
              <ProtectedRoute>
                <Books />
              </ProtectedRoute>
            }
          />





          {/* Fallback */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;