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
    return JSON.parse(serializedState) as PersistedState;
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
