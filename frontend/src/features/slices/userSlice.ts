import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  email: null,
  name: null,
  avatar: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      state.email = action.payload.email
      state.name = action.payload.name
      state.avatar = action.payload.avatar
    },
    removeUser(state) {
      state.email = null
      state.name = null
      state.avatar = null
    },
  },
});

export const { setUser, removeUser } = userSlice.actions;
export default userSlice.reducer;