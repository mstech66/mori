"use client";

import React, { useState } from "react";
import { ImageOutlined, CollectionsOutlined } from "@mui/icons-material";
import { modalActions } from "@/store/Modal";
import { noteActions, getNoteImages } from "@/store/Note";
import { useAppDispatch } from "@/store/Index";
import {
  formatDateString,
  formatTimeString,
  formatUserDate,
  formatUserTime,
} from "@/lib/dateTime";

export interface NoteProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "id" | "title" | "content"> {
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

// Helper to determine if a hex color is dark, for adaptive high-contrast styling
const isDarkColor = (hexColor?: string): boolean => {
  if (!hexColor) return false;
  const hex = hexColor.replace("#", "");
  let r = 0;
  let g = 0;
  let b = 0;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length >= 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }
  const luminance = (r * 299 + g * 587 + b * 114) / 1000;
  return luminance < 155;
};

const Note = React.forwardRef<HTMLDivElement, NoteProps>(
  (
    {
      id,
      title,
      content,
      color,
      type = "text",
      photoHeight,
      imageUrl,
      images,
      date,
      time,
      tag,
      createdAt,
      updatedAt,
      className,
      ...props
    },
    ref
  ) => {
    const dispatch = useAppDispatch();
    const [imageError, setImageError] = useState(false);

    const noteImages = getNoteImages({ images, imageUrl });
    const isPhoto = type === "photo" || noteImages.length > 0;
    const defaultColor = isPhoto ? "#a6663c" : "#fef08a";
    const noteColor = color || defaultColor;
    const isDark = isDarkColor(noteColor);

    const noteClickHandler = () => {
      dispatch(
        modalActions.showModal({
          data: {
            id,
            title,
            content,
            color: noteColor,
            type: isPhoto ? "photo" : "text",
            photoHeight,
            imageUrl: noteImages[0] || null,
            images: noteImages,
            date,
            time,
            tag,
            createdAt,
            updatedAt,
          },
        })
      );
    };

    const isEdited = Boolean(
      updatedAt && (!createdAt || updatedAt !== createdAt)
    );

    // Determine primary display date and time (Last Modified if edited, otherwise Created)
    let displayDate = "";
    let displayTime = "";
    let createdDateWithTime = "";

    if (isEdited && updatedAt) {
      displayDate = `Edited ${formatUserDate(updatedAt)}`;
      displayTime = formatUserTime(updatedAt);
      const originalDate = createdAt
        ? formatUserDate(createdAt)
        : formatDateString(date || "");
      const originalTime = createdAt
        ? formatUserTime(createdAt)
        : formatTimeString(time);
      createdDateWithTime = [originalDate, originalTime].filter(Boolean).join(", ");
    } else {
      displayDate = createdAt
        ? formatUserDate(createdAt)
        : formatDateString(date || "Nov 18");
      displayTime = createdAt ? formatUserTime(createdAt) : formatTimeString(time);
    }

    const rawTags = tag ? tag.trim().split(/\s+/).filter(Boolean) : [];

    const handleTagClick = (e: React.MouseEvent, clickedTagStr: string) => {
      e.stopPropagation();
      const cleanTag = clickedTagStr.replace(/^#+/, "").trim();
      if (cleanTag) {
        const formatted = cleanTag.charAt(0).toUpperCase() + cleanTag.slice(1);
        dispatch(noteActions.setSelectedTag(formatted));
      }
    };

    // Build comprehensive tooltip for hover
    let fullFooterTooltip = "";
    if (isEdited && updatedAt) {
      const editedInfo = `Edited ${formatUserDate(updatedAt)}, ${displayTime}`;
      const createdInfo = createdDateWithTime ? `Created ${createdDateWithTime}` : "";
      const dateTooltip = [editedInfo, createdInfo].filter(Boolean).join(" · ");
      fullFooterTooltip = [dateTooltip, tag].filter(Boolean).join(" · ");
    } else {
      const fullDateWithTime = displayTime ? `${displayDate}, ${displayTime}` : displayDate;
      fullFooterTooltip = [fullDateWithTime, tag].filter(Boolean).join(" · ");
    }

    const renderFooter = () => {
      if (!displayDate && rawTags.length === 0) return null;
      return (
        <div className="mt-1.5 px-0.5 overflow-hidden" title={fullFooterTooltip}>
          <p className="text-[11px] font-normal text-stone-500 dark:text-stone-400 truncate leading-tight">
            {displayDate}
            {rawTags.length > 0 && (
              <>
                {displayDate ? " · " : ""}
                {rawTags.slice(0, 2).map((t, idx) => (
                  <span
                    key={idx}
                    onClick={(e) => handleTagClick(e, t)}
                    className="hover:underline hover:text-stone-800 dark:hover:text-stone-200 cursor-pointer"
                  >
                    {t}
                    {idx < Math.min(rawTags.length, 2) - 1 ? " " : ""}
                  </span>
                ))}
                {rawTags.length > 2 && ` · +${rawTags.length - 2}`}
              </>
            )}
          </p>
        </div>
      );
    };

    return (
      <div
        ref={ref}
        onClick={noteClickHandler}
        className={`group cursor-pointer select-none mb-4 break-inside-avoid transition-all duration-300 hover:-translate-y-0.5 ${
          className || ""
        }`}
        {...props}
      >
        {isPhoto ? (
          /* Photo Note Style - Unified card matching regular notes */
          <div>
            <div
              style={{ backgroundColor: noteColor }}
              className="w-full rounded-[18px] overflow-hidden relative transition-all duration-300 group-hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)] flex flex-col"
            >
              {noteImages.length > 0 && !imageError ? (
                /* Actual Photo Banner */
                <div className="relative w-full overflow-hidden bg-black/5">
                  <img
                    src={noteImages[0]}
                    alt={title || "Photo note"}
                    onError={() => setImageError(true)}
                    className="w-full h-auto object-cover max-h-[220px] transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Photo circle badge with icon only */}
                  <div className="absolute bottom-2.5 left-2.5 w-6 h-6 rounded-full bg-white/90 dark:bg-stone-900/90 backdrop-blur-md flex items-center justify-center shadow-sm border border-black/5 select-none">
                    <ImageOutlined className="!text-[13px] text-stone-800 dark:text-stone-100" />
                  </div>

                  {/* Multi-photo count pill */}
                  {noteImages.length > 1 && (
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 dark:bg-black/75 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1 shadow-sm select-none border border-white/15">
                      <CollectionsOutlined className="!text-[12px]" />
                      <span>{noteImages.length}</span>
                    </div>
                  )}
                </div>
              ) : (
                /* Standard Website Image Placeholder (When no image or image fails to load) */
                <div
                  style={{
                    height: photoHeight ? `${photoHeight}px` : "165px",
                    minHeight: "120px",
                    maxHeight: "236px",
                  }}
                  className="relative w-full flex flex-col items-center justify-center bg-gradient-to-b from-black/[0.04] to-black/[0.14] dark:from-white/[0.03] dark:to-white/[0.09] overflow-hidden select-none transition-transform duration-500 group-hover:scale-102"
                >
                  {/* Standard placeholder illustration */}
                  <div
                    className={`flex flex-col items-center justify-center p-3 transition-transform duration-500 group-hover:scale-105 ${
                      isDark ? "text-white/50" : "text-stone-900/40"
                    }`}
                  >
                    <div className="relative w-14 h-14 flex items-center justify-center mb-1.5">
                      {/* Squircle backdrop blur & background */}
                      <div
                        className="absolute inset-0 rounded-2xl bg-black/[0.06] dark:bg-white/[0.08] backdrop-blur-xs"
                        style={{
                          clipPath:
                            "path('M 0 28 C 0 7.84 7.84 0 28 0 C 48.16 0 56 7.84 56 28 C 56 48.16 48.16 56 28 56 C 7.84 56 0 48.16 0 28 Z')",
                          WebkitClipPath:
                            "path('M 0 28 C 0 7.84 7.84 0 28 0 C 48.16 0 56 7.84 56 28 C 56 48.16 48.16 56 28 56 C 7.84 56 0 48.16 0 28 Z')",
                        }}
                      />
                      {/* Squircle border outline */}
                      <svg
                        className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-xs"
                        viewBox="0 0 56 56"
                      >
                        <path
                          d="M 0.5 28 C 0.5 8.2 8.2 0.5 28 0.5 C 47.8 0.5 55.5 8.2 55.5 28 C 55.5 47.8 47.8 55.5 28 55.5 C 8.2 55.5 0.5 47.8 0.5 28 Z"
                          fill="none"
                          className="stroke-black/5 dark:stroke-white/10"
                          strokeWidth="1"
                        />
                      </svg>
                      <ImageOutlined className="!text-[32px] opacity-85 relative z-10" />
                    </div>
                    <span className="text-[10px] font-semibold tracking-wider uppercase opacity-75">
                      No image
                    </span>
                  </div>

                  {/* Photo circle badge with icon only */}
                  <div className="absolute bottom-2.5 left-2.5 w-6 h-6 rounded-full bg-white/90 dark:bg-stone-900/90 backdrop-blur-md flex items-center justify-center shadow-sm border border-black/5 select-none">
                    <ImageOutlined className="!text-[13px] text-stone-800 dark:text-stone-100" />
                  </div>
                </div>
              )}

              {/* Note details inside the colored card (just like regular notes) */}
              {(title || content) && (
                <div className="p-3.5 pt-3">
                  {title && (
                    <h3
                      className={`text-[14px] font-bold leading-snug tracking-tight ${
                        isDark ? "text-white" : "text-stone-900"
                      }`}
                    >
                      {title}
                    </h3>
                  )}
                  {content && (
                    <div className="overflow-hidden relative mt-1">
                      <p
                        className={`text-[12px] font-normal leading-relaxed whitespace-pre-line break-words line-clamp-3 ${
                          isDark ? "text-white/80" : "text-stone-700"
                        }`}
                      >
                        {content}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Note metadata below card */}
            {renderFooter()}
          </div>
        ) : (
          /* Text Note Style */
          <div>
            <div
              style={{ backgroundColor: noteColor }}
              className="w-full min-h-[110px] max-h-[236px] rounded-[18px] p-4 flex flex-col justify-start overflow-hidden relative transition-all duration-300 group-hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)]"
            >
              {title && (
                <h3
                  className={`text-[14.5px] font-bold leading-snug tracking-tight mb-1.5 flex-shrink-0 ${
                    isDark ? "text-white" : "text-stone-900"
                  }`}
                >
                  {title}
                </h3>
              )}
              {content && (
                <div className="flex-1 overflow-hidden relative">
                  <p
                    className={`text-[12.5px] font-normal leading-relaxed whitespace-pre-line break-words ${
                      isDark ? "text-white/85" : "text-stone-700"
                    }`}
                  >
                    {content}
                  </p>
                  {/* Subtle fade-out gradient at the bottom for long text */}
                  <div
                    style={{
                      background: `linear-gradient(to bottom, transparent, ${noteColor})`,
                    }}
                    className="absolute bottom-0 left-0 right-0 h-5 pointer-events-none"
                  />
                </div>
              )}
            </div>

            {/* Note metadata below text card */}
            {renderFooter()}
          </div>
        )}
      </div>
    );
  }
);

Note.displayName = "Note";

export default Note;
