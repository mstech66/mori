import { initialDefaultNotes, NotesState } from "./Note";
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
    // If the persisted state only has the legacy sample note "n1", use initialDefaultNotes
    if (
      state.notes &&
      state.notes.notes &&
      (state.notes.notes.length === 0 ||
        (state.notes.notes.length === 1 && state.notes.notes[0].id === "n1"))
    ) {
      state.notes.notes = initialDefaultNotes;
      state.notes.selectedTag = "All";
    } else if (state.notes && state.notes.notes) {
      if (!state.notes.selectedTag) {
        state.notes.selectedTag = "All";
      }
      // Ensure existing saved notes have time populated
      const defaultTimeMap = new Map(
        initialDefaultNotes.map((n) => [n.id, n.time])
      );
      state.notes.notes = state.notes.notes.map((n) => {
        let updatedNote = { ...n };
        if (!updatedNote.time && defaultTimeMap.has(updatedNote.id)) {
          updatedNote.time = defaultTimeMap.get(updatedNote.id);
        }
        if (!updatedNote.images && updatedNote.imageUrl) {
          updatedNote.images = [updatedNote.imageUrl];
        }
        return updatedNote;
      });

      // Ensure demo old note is available if using demo notes set
      const hasOldNote = state.notes.notes.some(
        (n) => n.id === "n-archived-memories"
      );
      if (!hasOldNote && state.notes.notes.some((n) => n.id === "n-product-sync")) {
        const archivedNote = initialDefaultNotes.find(
          (n) => n.id === "n-archived-memories"
        );
        if (archivedNote) {
          state.notes.notes.push(archivedNote);
        }
      }
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
