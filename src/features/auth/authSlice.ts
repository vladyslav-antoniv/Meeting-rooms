import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  email: string | null;
  uid: string | null;
  displayName: string | null;
}

interface AuthState {
  user: UserState | null;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      state.user = action.payload;
      state.loading = false;
    },
    clearUser: (state) => {
      state.user = null;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    }
  },
});

export const { setUser, clearUser, setLoading } = authSlice.actions;
export default authSlice.reducer;