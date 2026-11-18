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

export const initialDefaultNotes: NoteItem[] = [
  // Column 1
  {
    id: "n-product-sync",
    title: "Product sync",
    content:
      "Launch moved to Nov 4 after the payment review.\nRiya owns onboarding emails.\nFinish landing page copy by Oct 28.\nAsk Arjun for analytics access.",
    color: "#fef08a",
    date: "Oct 13",
    time: "10:30 AM",
    tag: "#work",
    type: "text",
  },
  {
    id: "n-living-room",
    title: "Living room, warm and low",
    content: null,
    color: "#b98a67",
    photoHeight: 236,
    date: "Oct 12",
    time: "8:15 PM",
    tag: "#home",
    type: "photo",
  },
  // Column 2
  {
    id: "n-reading-list",
    title: "Reading list",
    content:
      "The Design of Everyday Things, ch. 4\nShape Up, the part on appetite\nLocal-first software essay",
    color: "#dce8fd",
    date: "Oct 11",
    time: "2:45 PM",
    tag: "#reading",
    type: "text",
  },
  {
    id: "n-saputara",
    title: "Saputara weekend",
    content: null,
    color: "#789c6c",
    photoHeight: 165,
    date: "Oct 10",
    time: "11:20 AM",
    tag: "#travel",
    type: "photo",
  },
  {
    id: "n-gym-plan",
    title: "Gym plan",
    content:
      "Mon push, Wed pull, Fri legs.\nAdd 2.5 kg to squat each week until it stalls.\nStretch hips after every session.",
    color: "#d8eccf",
    date: "Oct 9",
    time: "6:50 AM",
    tag: "#health",
    type: "text",
  },
  // Column 3
  {
    id: "n-masala-chai",
    title: "Masala chai, the good one",
    content: null,
    color: "#a6663c",
    photoHeight: 236,
    date: "Oct 7",
    time: "5:15 PM",
    tag: "#recipes",
    type: "photo",
  },
  {
    id: "n-app-ideas",
    title: "App ideas",
    content:
      "Notes that become tasks.\nOne capture line for everything.\nShare a board with a friend?",
    color: "#ede6fc",
    date: "Oct 5",
    time: "9:40 PM",
    tag: "#ideas",
    type: "text",
  },
  {
    id: "n-gift-ideas",
    title: "Gift ideas for Ma",
    content: null,
    color: "#dc9a46",
    photoHeight: 140,
    date: "Oct 2",
    time: "4:10 PM",
    tag: "#ideas",
    type: "photo",
  },
  // Column 4
  {
    id: "n-desk-setup",
    title: "Desk setup",
    content: null,
    color: "#7e8896",
    photoHeight: 236,
    date: "Sep 29",
    time: "1:25 PM",
    tag: "#home",
    type: "photo",
  },
  {
    id: "n-poha",
    title: "Poha, Sunday style",
    content:
      "Rinse 2 cups thick poha, rest 5 min.\nMustard seeds, curry leaves, peanuts, onion.\nTurmeric, salt, a squeeze of lemon.",
    color: "#fde5d4",
    date: "Sep 27",
    time: "9:00 AM",
    tag: "#recipes",
    type: "text",
  },
  {
    id: "n-q4-goals",
    title: "Q4 goals",
    content:
      "Ship the merged app.\nTwo blog posts.\nOne talk at the local meetup.",
    color: "#dbe8fd",
    date: "Sep 24",
    time: "3:30 PM",
    tag: "#work",
    type: "text",
  },
  // Column 5
  {
    id: "n-goa",
    title: "Goa in December",
    content: null,
    color: "#6299a3",
    photoHeight: 165,
    date: "Sep 20",
    time: "7:00 PM",
    tag: "#travel",
    type: "photo",
  },
  {
    id: "n-archived-memories",
    title: "Project kickoff archive",
    content:
      "Whiteboard notes from the v1 architecture brainstorm.\n- Monolith vs modular structure\n- Initial database schema draft\nKept for historical reference.",
    color: "#ede6fc",
    date: "Nov 18, 2020",
    time: "2:15 PM",
    tag: "#work",
    type: "text",
    createdAt: new Date("2020-11-18T14:15:00").getTime(),
  },
];

const initialState: NotesState = {
  notes: initialDefaultNotes,
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
      state.notes = initialDefaultNotes;
      state.selectedTag = "All";
    },
  },
});

export const noteActions = noteSlice.actions;

export default noteSlice.reducer;
