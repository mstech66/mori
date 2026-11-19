import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface NoteItem {
  id: string | number;
  title: string | null;
  content: string | null;
  color?: string;
  type?: "text" | "photo";
  photoHeight?: number | string;
  imageUrl?: string | null;
  images?: string[];
  date?: string;
  time?: string;
  tag?: string;
  createdAt?: number;
  updatedAt?: number;
}

export const MAX_IMAGES_PER_NOTE = 10;

export const getNoteImages = (note?: {
  images?: string[];
  imageUrl?: string | null;
}): string[] => {
  if (!note) return [];
  if (Array.isArray(note.images) && note.images.length > 0) {
    return note.images.filter(Boolean).slice(0, MAX_IMAGES_PER_NOTE);
  }
  if (note.imageUrl) {
    return [note.imageUrl];
  }
  return [];
};

export interface NotesState {
  notes: NoteItem[];
  selectedTag: string;
}

export const DEFAULT_TAGS = [
  "All",
  "Work",
  "Ideas",
  "Home",
  "Travel",
  "Recipes",
  "Reading",
  "Health",
];

export const normalizeTag = (t: string): string =>
  t.trim().replace(/^#+/, "").toLowerCase();

export const noteHasTag = (
  noteTag: string | undefined | null,
  filterTag: string
): boolean => {
  if (!filterTag || filterTag.toLowerCase() === "all") {
    return true;
  }
  if (!noteTag) {
    return false;
  }
  const target = normalizeTag(filterTag);
  const tags = noteTag
    .toLowerCase()
    .split(/[\s,;]+/)
    .map(normalizeTag)
    .filter(Boolean);
  return tags.includes(target);
};

export const initialDefaultNotes: NoteItem[] = [];

const initialState: NotesState = {
  notes: [],
  selectedTag: "All",
};

const noteSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    addNote(state, action: PayloadAction<NoteItem>) {
      state.notes.unshift(action.payload);
    },
    updateNote(state, action: PayloadAction<NoteItem>) {
      const index = state.notes.findIndex((note) => note.id === action.payload.id);
      if (index !== -1) {
        const updated = { ...state.notes[index], ...action.payload };
        // If modified with a new updatedAt timestamp, bubble note to top of list
        if (action.payload.updatedAt) {
          state.notes.splice(index, 1);
          state.notes.unshift(updated);
        } else {
          state.notes[index] = updated;
        }
      }
    },
    deleteNote(state, action: PayloadAction<{ id: string | number }>) {
      const id = action.payload.id;
      state.notes = state.notes.filter((note) => note.id !== id);
    },
    setSelectedTag(state, action: PayloadAction<string>) {
      state.selectedTag = action.payload;
    },
    resetNotes(state) {
      state.notes = [];
      state.selectedTag = "All";
    },
  },
});

export const noteActions = noteSlice.actions;

export default noteSlice.reducer;
