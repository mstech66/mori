"use client";

import React, { useEffect, useState } from "react";
import { Add } from "@mui/icons-material";
import { Fab, Zoom } from "@mui/material";
import { modalActions } from "@/store/Modal";
import { noteActions, noteHasTag } from "@/store/Note";
import { useAppDispatch, useAppSelector } from "@/store/Index";
import NoteModal from "../modal/NoteModal";
import Note from "../note/Note";
import TagChips from "../tags/TagChips";

const NotesList: React.FC = () => {
  const dispatch = useAppDispatch();
  const notes = useAppSelector((state) => state.notes.notes);
  const selectedTag = useAppSelector((state) => state.notes.selectedTag) || "All";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const addNoteHandler = () => {
    const defaultTag =
      selectedTag && selectedTag.toLowerCase() !== "all"
        ? `#${selectedTag.toLowerCase()}`
        : undefined;

    dispatch(
      modalActions.showModal({
        data: {
          title: null,
          content: null,
          color: "#fef08a",
          type: "text",
          tag: defaultTag,
        },
      })
    );
  };

  const filteredNotes = notes.filter((note) =>
    noteHasTag(note.tag, selectedTag)
  );

  return (
    <div className="relative min-h-[calc(100vh-80px)] max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      {/* Tag Navigation Chips */}
      <TagChips />

      <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-5 gap-3.5 sm:gap-4 [column-fill:_balance]">
        {/* "+ New note" card displayed at the beginning of the grid */}
        <div className="break-inside-avoid mb-4">
          <button
            type="button"
            onClick={addNoteHandler}
            aria-label="Create new note"
            className="w-full min-h-[110px] h-[110px] rounded-[18px] border-[1.5px] border-dashed border-stone-300 dark:border-stone-700 bg-[#ebece5]/60 dark:bg-stone-800/30 hover:bg-[#e4e5dd] dark:hover:bg-stone-800/60 hover:border-stone-400 dark:hover:border-stone-500 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center group focus:outline-none focus:ring-2 focus:ring-stone-400"
          >
            <Add className="!text-[22px] text-stone-500 dark:text-stone-400 group-hover:scale-110 transition-transform mb-1" />
            <span className="text-[12.5px] font-medium text-stone-700 dark:text-stone-300">
              New note
            </span>
          </button>
        </div>

        {/* Empty state when no notes match selected tag */}
        {mounted && filteredNotes.length === 0 && (
          <div className="break-inside-avoid mb-4">
            <div className="w-full min-h-[110px] h-[110px] rounded-[18px] border-[1.5px] border-dashed border-stone-300 dark:border-stone-700 bg-[#ebece5]/60 dark:bg-stone-800/30 px-3 py-2 text-center flex flex-col items-center justify-center">
              <p className="text-[12.5px] font-medium text-stone-600 dark:text-stone-400 truncate max-w-full px-2">
                No notes in #{selectedTag.toLowerCase()}
              </p>
              <button
                type="button"
                onClick={() => dispatch(noteActions.setSelectedTag("All"))}
                className="mt-1.5 text-[11.5px] font-semibold text-stone-700 dark:text-stone-300 underline hover:text-stone-900 dark:hover:text-stone-100 cursor-pointer"
              >
                Show all notes
              </button>
            </div>
          </div>
        )}

        {/* Note list */}
        {mounted &&
          filteredNotes.map((note) => (
            <Zoom key={note.id} in={true} timeout={300}>
              <Note
                id={note.id}
                title={note.title}
                content={note.content}
                color={note.color}
                type={note.type}
                photoHeight={note.photoHeight}
                imageUrl={note.imageUrl}
                images={note.images}
                date={note.date}
                time={note.time}
                tag={note.tag}
                createdAt={note.createdAt}
                updatedAt={note.updatedAt}
              />
            </Zoom>
          ))}
      </div>

      {/* Floating Action Button for quick access on mobile screens */}
      <div className="sm:hidden fixed bottom-6 right-6 z-40">
        <Fab
          color="default"
          size="medium"
          aria-label="Add note"
          onClick={addNoteHandler}
          className="!bg-stone-900 !text-white shadow-xl hover:!bg-stone-800"
        >
          <Add />
        </Fab>
      </div>

      <NoteModal />
    </div>
  );
};

export default NotesList;