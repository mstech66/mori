"use client";

import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  InputBase,
  Zoom,
} from "@mui/material";
import { modalActions } from "@/store/Modal";
import { noteActions } from "@/store/Note";
import { useAppDispatch, useAppSelector } from "@/store/Index";
import DialogTransition from "./DialogTransition";

const NoteModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState<string | undefined>();
  const [content, setContent] = useState<string | undefined>();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const open = useAppSelector((state) => state.modal.open);
  const data = useAppSelector((state) => state.modal.data);

  const isUpdating = !(data.title === null && data.content === null);

  const clearValues = () => {
    setTitle(undefined);
    setContent(undefined);
  };

  const saveNoteHandler = (event: React.SyntheticEvent) => {
    event.preventDefault();
    const newTitle =
      title === undefined
        ? data.title !== undefined
          ? data.title
          : null
        : title;
    const newContent =
      content === undefined
        ? data.content !== undefined
          ? data.content
          : null
        : content;

    if (!isUpdating) {
      const newId = Math.random();
      if (newTitle !== null || newContent !== null) {
        dispatch(
          noteActions.addNote({
            id: newId,
            title: newTitle,
            content: newContent,
          })
        );
      }
    } else {
      if (data.id !== undefined) {
        dispatch(
          noteActions.updateNote({
            id: data.id,
            title: newTitle,
            content: newContent,
          })
        );
      }
    }
    dispatch(modalActions.hideModal());
    clearValues();
  };

  const hideModalHandler = (event: React.SyntheticEvent) => {
    saveNoteHandler(event);
    dispatch(modalActions.hideModal());
  };

  const deleteNoteHandler = (event: React.SyntheticEvent) => {
    event.preventDefault();
    if (data.id !== undefined) {
      dispatch(noteActions.deleteNote({ id: data.id }));
    }
    dispatch(modalActions.hideModal());
  };

  const handleNextInput = () => {
    const contentInput = document.getElementById("content");
    if (contentInput) {
      contentInput.focus();
    }
  };

  if (!mounted) {
    return null;
  }

  const modalRoot = document.getElementById("modal-root") || document.body;

  return ReactDOM.createPortal(
    <Zoom in={open} timeout={500}>
      <div>
        <Dialog
          open={open}
          onClose={hideModalHandler}
          scroll="paper"
          TransitionComponent={DialogTransition}
          PaperProps={{
            className: "!rounded-lg !bg-[#f3e782] overflow-hidden shadow-2xl",
          }}
        >
          <DialogContent className="!bg-[#f3e782] !text-[#262626] w-auto h-auto min-w-[280px] sm:min-w-[480px] p-6">
            <InputBase
              id="title"
              className="!w-full !text-2xl !font-medium !mb-4.5 !text-[#262626]"
              placeholder="Title"
              autoFocus
              size="medium"
              defaultValue={data.title ? data.title : ""}
              onChange={({ target: { value } }) => setTitle(value)}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  handleNextInput();
                }
              }}
            />
            <InputBase
              id="content"
              className="!w-full !text-base !text-[#262626]"
              placeholder="Take a note..."
              multiline
              maxRows={20}
              defaultValue={data.content ? data.content : ""}
              onChange={({ target: { value } }) => setContent(value)}
            />
          </DialogContent>
          <DialogActions className="!bg-[#f3e782] px-6 pb-4 pt-0 justify-between sm:justify-end gap-2">
            {isUpdating && (
              <Button
                variant="text"
                className="!text-red-700 hover:!bg-red-500/10 !font-medium"
                onClick={deleteNoteHandler}
              >
                Delete
              </Button>
            )}
            <Button
              variant="text"
              className="!text-[#262626] hover:!bg-black/5 !font-medium"
              onClick={hideModalHandler}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </Zoom>,
    modalRoot
  );
};

export default NoteModal;
