import { configureStore } from "@reduxjs/toolkit";
import notesReducer from "./Note";
import modalReducer from "./Modal";
import themeReducer from "./Theme";
import { debounce } from "@mui/material";
import { loadState, saveState } from "./LocalStorage";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

const persistedState = loadState();

export const store = configureStore({
  reducer: {
    notes: notesReducer,
    modal: modalReducer,
    theme: themeReducer,
  },
  preloadedState: persistedState,
});

if (typeof window !== "undefined") {
  store.subscribe(
    debounce(() => {
      saveState({
        notes: store.getState().notes,
        theme: store.getState().theme,
      });
    }, 1000)
  );
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
