import { NotesState } from "./Note";
import { ThemeState } from "./Theme";

export interface PersistedState {
  notes?: NotesState;
  theme?: ThemeState;
}

export const loadState = (): PersistedState | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }
  try {
    const serializedState = localStorage.getItem("state");
    if (serializedState === null) {
      return undefined;
    }
    const state = JSON.parse(serializedState) as PersistedState;
    if (state.notes && Array.isArray(state.notes.notes)) {
      if (!state.notes.selectedTag) {
        state.notes.selectedTag = "All";
      }
      state.notes.notes = state.notes.notes.map((n) => {
        let updatedNote = { ...n };
        if (!updatedNote.images && updatedNote.imageUrl) {
          updatedNote.images = [updatedNote.imageUrl];
        }
        return updatedNote;
      });
    }
    return state;
  } catch (error) {
    return undefined;
  }
};

export const saveState = (state: PersistedState): void => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("state", serializedState);
  } catch (error) {
    console.log(error);
  }
};
