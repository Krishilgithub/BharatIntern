import { configureStore } from '@reduxjs/toolkit';
// Example slice (replace with actual slices as you build features)
import userReducer from '../../features/user/userSlice';

export const store = configureStore({
    reducer: {
        user: userReducer,
        // Add more slices here
    },
});

export default store;
