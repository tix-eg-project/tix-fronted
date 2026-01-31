import { configureStore } from '@reduxjs/toolkit';
import { apiReducer } from './Slice/api.slice';





const store = configureStore({
  reducer: {
    api:apiReducer
  }
});

export default store;
