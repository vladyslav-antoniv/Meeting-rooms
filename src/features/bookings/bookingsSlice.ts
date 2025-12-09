import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs, query, where, addDoc, deleteDoc, doc} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { type Booking } from '../../types';

interface BookingsState {
  items: Booking[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: BookingsState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchBookingsForRoom = createAsyncThunk(
  'bookings/fetchForRoom',
  async (roomId: string) => {
    const q = query(collection(db, "bookings"), where("roomId", "==", roomId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Booking[];
  }
);

export const fetchUserBookings = createAsyncThunk(
  'bookings/fetchUserBookings',
  async (userId: string) => {
    const q = query(collection(db, "bookings"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Booking[];
  }
);

export const addBooking = createAsyncThunk(
  'bookings/addBooking',
  async (bookingData: Omit<Booking, 'id'>) => {
    const docRef = await addDoc(collection(db, "bookings"), bookingData);
    return { id: docRef.id, ...bookingData };
  }
);

export const cancelBooking = createAsyncThunk(
  'bookings/cancelBooking',
  async (bookingId: string) => {
    await deleteDoc(doc(db, "bookings", bookingId));
    return bookingId;
  }
);

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearBookings: (state) => {
      state.items = [];
      state.status = 'idle';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookingsForRoom.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBookingsForRoom.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      
      .addCase(fetchUserBookings.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserBookings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })

      .addCase(addBooking.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })

      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.items = state.items.filter(b => b.id !== action.payload);
      });
  },
});

export const { clearBookings } = bookingsSlice.actions;
export default bookingsSlice.reducer;