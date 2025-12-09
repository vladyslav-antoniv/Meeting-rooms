import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { type Room } from '../../types';

interface RoomsState {
  items: Room[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: RoomsState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchRooms = createAsyncThunk('rooms/fetchRooms', async () => {
  const q = query(collection(db, "rooms"), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Room[];
});

export const deleteRoom = createAsyncThunk('rooms/deleteRoom', async (roomId: string) => {
  await deleteDoc(doc(db, "rooms", roomId));
  return roomId;
});

export const updateRoom = createAsyncThunk(
  'rooms/updateRoom',
  async ({ id, data }: { id: string; data: Partial<Room> }) => {
    await updateDoc(doc(db, "rooms", id), data);
    return { id, data };
  }
);

const roomsSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRooms.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Error';
      })
      .addCase(deleteRoom.fulfilled, (state, action) => {
        state.items = state.items.filter(room => room.id !== action.payload);
      })
      .addCase(updateRoom.fulfilled, (state, action) => {
        const index = state.items.findIndex(room => room.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...action.payload.data };
        }
      });
  },
});

export default roomsSlice.reducer;