import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ModalData {
  id?: string | number;
  title?: string | null;
  content?: string | null;
}

export interface ModalState {
  open: boolean;
  data: ModalData;
}

const initialState: ModalState = {
  open: false,
  data: {},
};

const modal = createSlice({
  name: "modal",
  initialState,
  reducers: {
    showModal(state, action: PayloadAction<{ data: ModalData }>) {
      state.open = true;
      state.data = action.payload.data;
    },
    hideModal(state) {
      state.open = false;
    },
  },
});

export const modalActions = modal.actions;

export default modal.reducer;
