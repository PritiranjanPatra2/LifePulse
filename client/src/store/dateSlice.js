import { createSlice } from '@reduxjs/toolkit';

const getTodayString = () => new Date().toISOString().split('T')[0];

const dateSlice = createSlice({
  name: 'date',
  initialState: {
    selectedDate: getTodayString(),
  },
  reducers: {
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
    goToPreviousDay: (state) => {
      const d = new Date(state.selectedDate);
      d.setDate(d.getDate() - 1);
      state.selectedDate = d.toISOString().split('T')[0];
    },
    goToNextDay: (state) => {
      const d = new Date(state.selectedDate);
      d.setDate(d.getDate() + 1);
      state.selectedDate = d.toISOString().split('T')[0];
    },
    goToToday: (state) => {
      state.selectedDate = getTodayString();
    },
  },
});

export const { setSelectedDate, goToPreviousDay, goToNextDay, goToToday } = dateSlice.actions;
export default dateSlice.reducer;
