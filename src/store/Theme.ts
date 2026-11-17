import { createSlice } from "@reduxjs/toolkit";

export interface ThemeState {
  isDarkMode: boolean;
}

const initialState: ThemeState = { isDarkMode: false };

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme(state) {
      state.isDarkMode = !state.isDarkMode;
    },
  },
});

export const themeActions = themeSlice.actions;

export default themeSlice.reducer;
