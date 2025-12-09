import React, { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { auth } from "./config/firebase";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { setUser, clearUser } from "./features/auth/authSlice";
import { LoginPage } from "./features/auth/LoginPage";
import { RegisterPage } from "./features/auth/RegisterPage";
import { CreateRoomPage } from "./features/rooms/CreateRoomPage";
import { RoomsList } from "./features/rooms/RoomsList";
import { RoomDetailsPage } from "./features/bookings/RoomDetailsPage";
import { MyBookingsPage } from "./features/bookings/MyBookingsPage";
import { EditRoomPage } from "./features/rooms/EditRoomPage";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAppSelector((state) => state.auth);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (!user) return <Navigate to="/login" />;

  return <>{children}</>;
};

function App() {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        dispatch(
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
          })
        );
      } else {
        dispatch(clearUser());
      }
    });
    return () => unsubscribe();
  }, [dispatch]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        Loading application...
      </div>
    );

  return (
    <BrowserRouter>
      <Toaster position="top-right" />

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <MyBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rooms/:id/edit"
          element={
            <ProtectedRoute>
              <EditRoomPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-room"
          element={
            <ProtectedRoute>
              <CreateRoomPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rooms/:id"
          element={
            <ProtectedRoute>
              <RoomDetailsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div className="p-8 max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                      Meeting Rooms
                    </h1>
                    <p className="text-gray-500 mt-1">
                      Book a space for your team
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Link
                      to="/my-bookings"
                      className="text-gray-600 hover:text-blue-600 font-medium"
                    >
                      My Bookings
                    </Link>

                    <Link
                      to="/create-room"
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center"
                    >
                      + Add Room
                    </Link>

                    <button
                      onClick={() => auth.signOut()}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition"
                    >
                      Logout
                    </button>
                  </div>
                </header>

                <RoomsList />
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
