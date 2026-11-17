"use client";

import React from "react";
import { modalActions } from "@/store/Modal";
import { useAppDispatch } from "@/store/Index";

export interface NoteProps {
  id: string | number;
  title: string | null;
  content: string | null;
}

const Note: React.FC<NoteProps> = ({ id, title, content }) => {
  const dispatch = useAppDispatch();

  const noteClickHandler = () => {
    dispatch(
      modalActions.showModal({
        data: { id, title, content },
      })
    );
  };

  return (
    <div
      onClick={noteClickHandler}
      className="bg-[#f3e782] h-fit rounded-lg p-2 text-[#262626] select-none max-h-[400px] mb-2.5 overflow-hidden transition-all duration-500 hover:shadow-[0_5px_8px_rgba(0,0,0,0.15)] cursor-pointer break-inside-avoid"
    >
      {title && <p className="text-[1.5rem] leading-tight m-3 font-medium">{title}</p>}
      {content && <p className="text-base break-words m-3 whitespace-pre-line">{content}</p>}
    </div>
  );
};

export default Note;
