import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AlarmManager from './components/alarms/AlarmManager';
import { AlarmProvider } from './contexts/AlarmContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AlarmsPage from './pages/AlarmsPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AlarmProvider>
          <AlarmManager />
          <Routes>
            {/* Login */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Dashboard */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Pagina Allarmi*/}
            <Route 
              path="/dashboard/allarmi" 
              element={
                <ProtectedRoute>
                  <AlarmsPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Redirect root */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AlarmProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

