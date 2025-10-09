import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isAuthenticated: false,
    userInfo: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        login(state, action) {
            state.isAuthenticated = true;
            state.userInfo = action.payload;
        },
        logout(state) {
            state.isAuthenticated = false;
            state.userInfo = null;
        },
        // Add more user actions as needed
    },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
