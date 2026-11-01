import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import dateReducer from './dateSlice';
import themeReducer from './themeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    date: dateReducer,
    theme: themeReducer,
  },
});
