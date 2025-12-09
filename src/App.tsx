import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { auth } from './config/firebase';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { setUser, clearUser } from './features/auth/authSlice';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAppSelector((state) => state.auth);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return children;
};

function App() {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        dispatch(setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName
        }));
      } else {
        dispatch(clearUser());
      }
    });
    return () => unsubscribe();
  }, [dispatch]);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading application...</div>;

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <div className="p-8">
                <header className="flex justify-between items-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-800">Meeting Rooms</h1>
                  <button 
                    onClick={() => auth.signOut()}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
                  >
                    Logout
                  </button>
                </header>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <p className="text-gray-600">The room list.</p>
                </div>
              </div>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;