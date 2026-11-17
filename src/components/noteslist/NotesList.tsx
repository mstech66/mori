"use client";

import React, { useEffect, useState } from "react";
import { Add } from "@mui/icons-material";
import { Fab, Zoom } from "@mui/material";
import { modalActions } from "@/store/Modal";
import { useAppDispatch, useAppSelector } from "@/store/Index";
import NoteModal from "../modal/NoteModal";
import Note from "../note/Note";

const NotesList: React.FC = () => {
  const dispatch = useAppDispatch();
  const notes = useAppSelector((state) => state.notes.notes);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const addNoteHandler = () => {
    dispatch(
      modalActions.showModal({
        data: {
          id: Math.random(),
          title: null,
          content: null,
        },
      })
    );
  };

  return (
    <div className="relative">
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-6 gap-2.5 m-8">
        {mounted &&
          notes.map((note) => (
            <Zoom
              key={note.id}
              in={true}
              timeout={500}
              style={{ transitionDelay: "1000ms" }}
            >
              <div className="break-inside-avoid">
                <Note
                  id={note.id}
                  title={note.title}
                  content={note.content}
                />
              </div>
            </Zoom>
          ))}
      </div>
      <Fab
        color="primary"
        aria-label="Add note"
        className="!fixed !bottom-8 !right-8 !m-0 !top-auto !left-auto z-50 shadow-lg"
        onClick={addNoteHandler}
      >
        <Add />
      </Fab>
      <NoteModal />
    </div>
  );
};

export default NotesList;
