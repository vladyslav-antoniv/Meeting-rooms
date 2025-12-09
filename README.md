# 🏢 Meeting Room Booking App

A modern web application for managing office meeting rooms, checking availability, and booking time slots. Built with **React**, **TypeScript**, and **Firebase**, utilizing **Redux Toolkit** for efficient state management.

## 🚀 Features

### 👤 Authentication & Users
- **Secure Login/Registration:** Email and password authentication via Firebase Auth.
- **Profile Management:** Automatic profile creation in Firestore upon registration.
- **Protected Routes:** Unauthorized users are redirected to the login page.

### 🏢 Room Management (CRUD)
- **Create Rooms:** Add new meeting rooms with details (name, capacity, description).
- **Edit Rooms:** Owners can update room details and manage access permissions.
- **Delete Rooms:** Remove rooms from the system (Owner only).
- **Access Control:** Grant `Admin` or `User` roles to colleagues via email.

### 📅 Booking System
- **Conflict Detection:** Smart algorithm prevents double-booking for overlapping time slots.
- **Calendar View:** Visual representation of booked slots for a specific day.
- **My Bookings:** dedicated dashboard for users to view and cancel their own meetings.

---

## 🛠️ Tech Stack

- **Core:** React, TypeScript, Vite
- **State Management:** Redux Toolkit (createSlice, createAsyncThunk)
- **Styling:** Tailwind CSS, clsx, tailwind-merge
- **Backend & Database:** Firebase Authentication, Cloud Firestore
- **Forms & Validation:** React Hook Form, Zod
- **Date Handling:** date-fns
- **Icons & UI:** Lucide React, React Hot Toast

---

## 📂 Project Structure

The project follows a **Feature-Based Architecture** for better scalability and maintainability:

```text
src/
├── app/                 # Redux store and global hooks
├── components/          # Shared UI components (Layouts, Buttons)
├── config/              # Firebase configuration
├── features/            # Feature-specific logic
│   ├── auth/            # Login, Register forms & slices
│   ├── bookings/        # Booking logic, calendar, history
│   └── rooms/           # Room listing, creation, and editing
├── types/               # Global TypeScript interfaces
└── utils/               # Helper functions (e.g., date overlap check)