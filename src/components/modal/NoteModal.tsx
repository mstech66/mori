"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  InputBase,
  Tooltip,
} from "@mui/material";
import {
  NotesOutlined,
  DeleteOutline,
  Check,
  CloudUploadOutlined,
  FolderOpenOutlined,
  Close,
  LinkOutlined,
  ImageOutlined,
  ExpandMore,
  ZoomIn,
  AddPhotoAlternateOutlined,
  CollectionsOutlined,
} from "@mui/icons-material";
import { modalActions } from "@/store/Modal";
import { noteActions, MAX_IMAGES_PER_NOTE, getNoteImages } from "@/store/Note";
import { useAppDispatch, useAppSelector } from "@/store/Index";
import DialogTransition from "./DialogTransition";
import FullscreenImageViewer from "./FullscreenImageViewer";
import {
  formatUserDate,
  formatUserTime,
  formatUserDateTime,
  formatDateString,
  formatTimeString,
} from "@/lib/dateTime";

// Unified palette available for both text and photo notes
export const NOTE_COLORS = [
  "#fef08a", // soft yellow
  "#dce8fd", // soft periwinkle blue
  "#d8eccf", // soft mint green
  "#ede6fc", // soft lavender
  "#fde5d4", // soft peach
  "#dbe9fe", // soft sky blue
  "#b98a67", // camel tan
  "#789c6c", // sage green
  "#a6663c", // terracotta brown
  "#dc9a46", // golden amber
  "#7e8896", // slate gray
  "#6299a3", // teal cyan
];

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



const DEFAULT_NOTE_TIMES: Record<string, string> = {
  "n-product-sync": "10:30 AM",
  "n-living-room": "8:15 PM",
  "n-reading-list": "2:45 PM",
  "n-saputara": "11:20 AM",
  "n-gym-plan": "6:50 AM",
  "n-masala-chai": "5:15 PM",
  "n-app-ideas": "9:40 PM",
  "n-gift-ideas": "4:10 PM",
  "n-desk-setup": "1:25 PM",
  "n-poha": "9:00 AM",
  "n-q4-goals": "3:30 PM",
  "n-goa": "7:00 PM",
  "n-archived-memories": "2:15 PM",
};

const NoteModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);

  const open = useAppSelector((state) => state.modal.open);
  const data = useAppSelector((state) => state.modal.data);

  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [color, setColor] = useState<string>(NOTE_COLORS[0]);
  const [type, setType] = useState<"text" | "photo">("text");
  const [images, setImages] = useState<string[]>([]);
  const [tag, setTag] = useState<string>("");
  const [noteDate, setNoteDate] = useState<string>("");
  const [noteTime, setNoteTime] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isColorExpanded, setIsColorExpanded] = useState(false);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const [imageWarning, setImageWarning] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (imageWarning) {
      const timer = setTimeout(() => setImageWarning(""), 3500);
      return () => clearTimeout(timer);
    }
  }, [imageWarning]);

  useEffect(() => {
    if (open) {
      setTitle(data.title || "");
      setContent(data.content || "");
      const loadedImages = getNoteImages(data);
      const isPhoto = data.type === "photo" || loadedImages.length > 0;
      setType(isPhoto ? "photo" : "text");
      setColor(data.color || NOTE_COLORS[0]);
      setImages(loadedImages);
      setTag(data.tag || "");
      setIsDragging(false);
      setShowUrlInput(false);
      setUrlInputValue("");
      setConfirmDelete(false);
      setIsColorExpanded(false);
      setFullscreenOpen(false);
      setFullscreenIndex(0);
      setImageWarning("");

      const rawDate = data.date || formatUserDate();
      const rawTime =
        data.time ||
        (data.id && DEFAULT_NOTE_TIMES[String(data.id)]) ||
        (data.createdAt ? formatUserTime(data.createdAt) : formatUserTime());

      setNoteDate(formatDateString(rawDate));
      setNoteTime(formatTimeString(rawTime));
    }
  }, [open, data]);

  // Auto-reset delete confirmation after 3.5 seconds of inactivity
  useEffect(() => {
    if (confirmDelete) {
      const timer = setTimeout(() => setConfirmDelete(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [confirmDelete]);

  const isUpdating = data.id !== undefined;
  const isDark = isDarkColor(color);

  const createdDisplay =
    (data.createdAt
      ? formatUserDateTime(data.createdAt)
      : [noteDate, noteTime].filter(Boolean).join(" · ")) || "Just now";

  const modifiedDisplay = data.updatedAt
    ? formatUserDateTime(data.updatedAt)
    : createdDisplay;

  const isEdited = Boolean(
    data.updatedAt && (!data.createdAt || data.updatedAt !== data.createdAt)
  );

  // File processing helper: reads multiple files into Data URLs and sets images array
  const processImageFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );
    if (fileArray.length === 0) return;

    const remainingSlots = MAX_IMAGES_PER_NOTE - images.length;
    if (remainingSlots <= 0) {
      setImageWarning(`Maximum limit of ${MAX_IMAGES_PER_NOTE} photos reached for this note.`);
      return;
    }

    if (fileArray.length > remainingSlots) {
      setImageWarning(
        `Added ${remainingSlots} photo(s). Maximum ${MAX_IMAGES_PER_NOTE} photos per note reached.`
      );
    }

    const filesToRead = fileArray.slice(0, remainingSlots);

    Promise.all(
      filesToRead.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              const result = event.target?.result as string;
              resolve(result || "");
            };
            reader.onerror = () => resolve("");
            reader.readAsDataURL(file);
          })
      )
    ).then((dataUrls) => {
      const validUrls = dataUrls.filter(Boolean);
      if (validUrls.length > 0) {
        setImages((prev) => [...prev, ...validUrls].slice(0, MAX_IMAGES_PER_NOTE));
        setType("photo");
      }
    });
  };

  // Clipboard paste handler
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      const pastedFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf("image") !== -1) {
          const file = item.getAsFile();
          if (file) {
            pastedFiles.push(file);
          }
        }
      }
      if (pastedFiles.length > 0) {
        e.preventDefault();
        processImageFiles(pastedFiles);
        return;
      }
    }

    const pastedText = e.clipboardData?.getData("text") || "";
    if (
      pastedText &&
      (/\.(jpeg|jpg|gif|png|webp|svg)($|\?)/i.test(pastedText) ||
        pastedText.startsWith("data:image/"))
    ) {
      if (images.length >= MAX_IMAGES_PER_NOTE) {
        setImageWarning(`Maximum limit of ${MAX_IMAGES_PER_NOTE} photos reached.`);
        return;
      }
      setImages((prev) => [...prev, pastedText].slice(0, MAX_IMAGES_PER_NOTE));
      setType("photo");
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processImageFiles(e.target.files);
    }
    e.target.value = "";
  };

  const handleAddUrl = () => {
    const cleanUrl = urlInputValue.trim();
    if (!cleanUrl) return;

    if (images.length >= MAX_IMAGES_PER_NOTE) {
      setImageWarning(`Maximum limit of ${MAX_IMAGES_PER_NOTE} photos reached.`);
      return;
    }

    setImages((prev) => [...prev, cleanUrl].slice(0, MAX_IMAGES_PER_NOTE));
    setUrlInputValue("");
    setShowUrlInput(false);
    setType("photo");
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const openFullscreenAt = (index: number) => {
    setFullscreenIndex(index);
    setFullscreenOpen(true);
  };

  const handleTypeSwitch = (newType: "text" | "photo") => {
    setType(newType);
  };

  const saveNoteHandler = () => {
    const finalTitle = title.trim() || null;
    const finalContent = content.trim() || null;
    const finalTag = tag.trim() ? (tag.startsWith("#") ? tag : `#${tag}`) : undefined;
    const finalDate = noteDate || formatUserDate();
    const finalTime = noteTime || formatUserTime();
    const cleanImages = images.filter(Boolean).slice(0, MAX_IMAGES_PER_NOTE);
    const primaryImage = cleanImages[0] || null;

    // If both title and content are empty (and no images for photo note), don't save
    if (type === "text" && !finalTitle && !finalContent) {
      dispatch(modalActions.hideModal());
      return;
    }
    if (type === "photo" && !finalTitle && !finalContent && cleanImages.length === 0) {
      dispatch(modalActions.hideModal());
      return;
    }

    if (!isUpdating) {
      const newId = `note_${Date.now()}`;
      dispatch(
        noteActions.addNote({
          id: newId,
          title: finalTitle,
          content: finalContent,
          color,
          type,
          photoHeight: type === "photo" ? 180 : undefined,
          imageUrl: primaryImage,
          images: cleanImages,
          date: finalDate,
          time: finalTime,
          tag: finalTag,
          createdAt: Date.now(),
        })
      );
    } else {
      if (data.id !== undefined) {
        const existingImages = getNoteImages(data);
        const imagesChanged =
          cleanImages.length !== existingImages.length ||
          cleanImages.some((img, idx) => img !== existingImages[idx]);

        // Detect if user made any actual changes before marking as edited
        const hasChanged =
          finalTitle !== (data.title || null) ||
          finalContent !== (data.content || null) ||
          color !== (data.color || NOTE_COLORS[0]) ||
          type !== (data.type || "text") ||
          imagesChanged ||
          finalTag !== (data.tag || undefined);

        if (hasChanged) {
          dispatch(
            noteActions.updateNote({
              id: data.id,
              title: finalTitle,
              content: finalContent,
              color,
              type,
              photoHeight: data.photoHeight || (type === "photo" ? 180 : undefined),
              imageUrl: primaryImage,
              images: cleanImages,
              date: finalDate,
              time: finalTime,
              tag: finalTag,
              createdAt: data.createdAt,
              updatedAt: Date.now(),
            })
          );
        }
      }
    }
    dispatch(modalActions.hideModal());
  };

  const deleteNoteHandler = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    if (data.id !== undefined) {
      dispatch(noteActions.deleteNote({ id: data.id }));
    }
    dispatch(modalActions.hideModal());
  };

  const handleNextInput = () => {
    const contentInput = document.getElementById("note-content-input");
    if (contentInput) {
      contentInput.focus();
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <Dialog
      open={open}
      onClose={saveNoteHandler}
      scroll="paper"
      TransitionComponent={DialogTransition}
      PaperProps={{
        style: {
          backgroundColor: color,
          transition: "background-color 0.25s ease-in-out",
        },
        className:
          "!rounded-[28px] overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] !max-w-[620px] !w-full !m-4 border border-black/10 dark:border-white/10 relative transition-all duration-300",
      }}
    >
      <div
        onPaste={handlePaste}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="relative flex flex-col min-h-[460px]"
      >
        {/* Hidden file input for multiple image browsing */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileInputChange}
        />

        {/* Drag and Drop Active Overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-50 rounded-[28px] bg-black/40 backdrop-blur-md border-2 border-dashed border-white/80 flex flex-col items-center justify-center p-6 text-white text-center pointer-events-none transition-all">
            <CloudUploadOutlined className="!text-5xl mb-2 animate-bounce" />
            <p className="text-lg font-bold">Drop photos to attach</p>
            <p className="text-xs text-white/80 mt-1">
              Supports up to {MAX_IMAGES_PER_NOTE} photos per note
            </p>
          </div>
        )}

        {/* Top Bar Header with Frosted Glass Floating Pills */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2 gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Left Pill: Note / Photo Mode Switcher with Smooth Sliding Indicator */}
          <div
            className={`relative flex items-center p-1 rounded-full backdrop-blur-md transition-colors border flex-shrink-0 select-none ${
              isDark
                ? "bg-white/15 border-white/15"
                : "bg-black/[0.06] border-black/10"
            }`}
          >
            {/* Sliding Pill Indicator */}
            <div
              className={`absolute top-1 bottom-1 left-1 w-20 rounded-full transition-transform duration-300 ease-out shadow-sm pointer-events-none ${
                type === "photo" ? "translate-x-full" : "translate-x-0"
              } ${isDark ? "bg-white" : "bg-stone-900"}`}
            />

            <button
              type="button"
              onClick={() => handleTypeSwitch("text")}
              className={`relative z-10 w-20 py-1.5 flex items-center justify-center gap-1.5 rounded-full text-xs font-semibold transition-colors duration-200 ${
                type === "text"
                  ? isDark
                    ? "text-stone-900"
                    : "text-white"
                  : isDark
                  ? "text-white/70 hover:text-white"
                  : "text-stone-700 hover:text-stone-900"
              }`}
            >
              <NotesOutlined className="!text-sm" />
              <span>Note</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeSwitch("photo")}
              className={`relative z-10 w-20 py-1.5 flex items-center justify-center gap-1.5 rounded-full text-xs font-semibold transition-colors duration-200 ${
                type === "photo"
                  ? isDark
                    ? "text-stone-900"
                    : "text-white"
                  : isDark
                  ? "text-white/70 hover:text-white"
                  : "text-stone-700 hover:text-stone-900"
              }`}
            >
              <ImageOutlined className="!text-sm" />
              <span>Photo</span>
            </button>
          </div>

          {/* Right Pill: Color pill with clean circle and chevron */}
          <div
            className="relative flex items-center"
            onMouseEnter={() => setIsColorExpanded(true)}
            onMouseLeave={() => setIsColorExpanded(false)}
          >
            <button
              type="button"
              onClick={() => setIsColorExpanded(!isColorExpanded)}
              aria-label="Change note color"
              className={`h-[34px] px-2.5 rounded-full backdrop-blur-md flex items-center gap-1.5 border transition-all select-none ${
                isDark
                  ? "bg-white/15 border-white/20 text-white hover:bg-white/20"
                  : "bg-black/[0.06] border-black/10 text-stone-800 hover:bg-black/[0.09]"
              }`}
            >
              <div
                style={{ backgroundColor: color }}
                className="w-5 h-5 rounded-full border border-black/25 dark:border-white/30 shadow-sm flex-shrink-0"
              />
              <ExpandMore
                className={`!text-[16px] opacity-60 transition-transform duration-200 ${
                  isColorExpanded ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Floating Color Palette Card - Smooth Animated 2x6 Grid */}
            <div
              className={`absolute right-0 top-full pt-1.5 z-50 w-[248px] transition-all duration-200 ease-out origin-top-right ${
                isColorExpanded
                  ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                  : "opacity-0 -translate-y-1 scale-95 pointer-events-none"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`w-full p-2.5 rounded-[20px] backdrop-blur-2xl border shadow-[0_12px_32px_rgba(0,0,0,0.14)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.45)] ${
                  isDark
                    ? "bg-stone-900/95 border-white/15 text-white"
                    : "bg-white/95 border-black/10 text-stone-800"
                }`}
              >
                {/* 2 Rows x 6 Columns Color Grid */}
                <div className="grid grid-cols-6 gap-2">
                  {NOTE_COLORS.map((c) => {
                    const isDotDark = isDarkColor(c);
                    const isSelected = color === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        style={{ backgroundColor: c }}
                        aria-label={`Select color ${c}`}
                        className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-150 ease-out hover:scale-115 active:scale-95 ${
                          isSelected
                            ? isDark
                              ? "ring-2 ring-white scale-105 border-transparent shadow-sm"
                              : "ring-2 ring-stone-900 scale-105 border-transparent shadow-sm"
                            : "border-black/15 dark:border-white/20 hover:shadow-xs"
                        }`}
                      >
                        {isSelected && (
                          <Check
                            className={`!text-[14px] ${
                              isDotDark ? "text-white" : "text-stone-900"
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <DialogContent className="!px-6 !py-3 flex-1 flex flex-col space-y-3 !bg-transparent">
          {/* Photo Section with smooth height, opacity and slide animation */}
          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              type === "photo"
                ? "max-h-[460px] opacity-100 translate-y-0"
                : "max-h-0 opacity-0 -translate-y-2 pointer-events-none"
            }`}
          >
            <div className="space-y-2 pb-1">
              {/* Warning notification banner if user reaches limit */}
              {imageWarning && (
                <div className="p-2.5 px-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-medium flex items-center justify-between animate-in fade-in">
                  <span>{imageWarning}</span>
                  <button
                    type="button"
                    onClick={() => setImageWarning("")}
                    className="opacity-70 hover:opacity-100 text-xs ml-2 font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              {images.length > 0 ? (
                <div className="space-y-2">
                  {/* Gallery Subheader Bar */}
                  <div className="flex items-center justify-between px-0.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-semibold ${
                          isDark ? "text-white/90" : "text-stone-800"
                        }`}
                      >
                        Photos
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          isDark
                            ? "bg-white/15 text-white/90"
                            : "bg-black/10 text-stone-700"
                        }`}
                      >
                        {images.length} / {MAX_IMAGES_PER_NOTE}
                      </span>
                      <span
                        className={`text-[11px] hidden sm:inline ${
                          isDark ? "text-white/50" : "text-stone-500"
                        }`}
                      >
                        · Click photo to view full screen
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {images.length < MAX_IMAGES_PER_NOTE && (
                        <>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className={`h-6 px-2.5 rounded-full flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer ${
                              isDark
                                ? "bg-white/15 hover:bg-white/25 text-white"
                                : "bg-black/10 hover:bg-black/15 text-stone-800"
                            }`}
                          >
                            <AddPhotoAlternateOutlined className="!text-[13px]" />
                            <span>Add</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowUrlInput(!showUrlInput)}
                            className={`h-6 px-2.5 rounded-full flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer ${
                              isDark
                                ? "bg-white/10 hover:bg-white/20 text-white/80"
                                : "bg-black/5 hover:bg-black/10 text-stone-700"
                            }`}
                          >
                            <LinkOutlined className="!text-[13px]" />
                            <span>URL</span>
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => setImages([])}
                        className={`h-6 px-2 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                          isDark
                            ? "text-red-300 hover:bg-red-500/20"
                            : "text-red-600 hover:bg-red-500/10"
                        }`}
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Optional URL Input */}
                  {showUrlInput && images.length < MAX_IMAGES_PER_NOTE && (
                    <div className="flex items-center gap-2 pt-0.5 pb-1">
                      <InputBase
                        value={urlInputValue}
                        onChange={(e) => setUrlInputValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddUrl();
                          }
                        }}
                        placeholder="Paste image link and press Enter..."
                        className={`!w-full !text-xs !rounded-xl !px-3 !py-1.5 border transition-all ${
                          isDark
                            ? "!bg-black/20 !text-white border-white/20 placeholder:!text-white/50"
                            : "!bg-black/[0.04] !text-stone-900 border-black/10 placeholder:!text-stone-500"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={handleAddUrl}
                        className={`h-7 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                          isDark
                            ? "bg-white text-stone-900 hover:bg-white/90"
                            : "bg-stone-900 text-white hover:bg-stone-800"
                        }`}
                      >
                        Add
                      </button>
                    </div>
                  )}

                  {/* Multi-Photo Grid */}
                  {images.length === 1 ? (
                    /* Single Photo Featured Hero View with Click-to-Fullscreen */
                    <div
                      onClick={() => openFullscreenAt(0)}
                      className="relative w-full rounded-2xl overflow-hidden border border-black/10 shadow-sm group cursor-pointer"
                    >
                      <div className="max-h-[240px] w-full overflow-hidden flex items-center justify-center bg-black/10">
                        <img
                          src={images[0]}
                          alt="Note photo preview"
                          className="w-full h-full object-cover max-h-[240px] transition-transform duration-300 group-hover:scale-102"
                        />
                      </div>

                      {/* Hover Fullscreen Indicator */}
                      <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-white transition-opacity duration-200 backdrop-blur-[1px]">
                        <ZoomIn className="!text-2xl" />
                        <span className="text-xs font-semibold drop-shadow-sm">
                          Click to view full screen
                        </span>
                      </div>

                      {/* Photo circle badge */}
                      <div className="absolute bottom-3 left-3 w-7 h-7 rounded-full bg-white/95 dark:bg-stone-900/90 backdrop-blur-md flex items-center justify-center shadow-md border border-black/5 select-none pointer-events-none">
                        <ImageOutlined className="!text-[15px] text-stone-800 dark:text-stone-100" />
                      </div>

                      {/* Actions overlay */}
                      <div
                        className="absolute top-3 right-3 flex items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="h-7 px-3 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md text-xs font-medium flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                        >
                          <FolderOpenOutlined className="!text-[14px]" />
                          <span>Change</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(0)}
                          className="w-7 h-7 rounded-full bg-black/60 hover:bg-red-600 text-white backdrop-blur-md flex items-center justify-center shadow-sm transition-colors cursor-pointer"
                          title="Remove photo"
                          aria-label="Remove photo"
                        >
                          <Close className="!text-[14px]" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* 2 to 10 Photos Grid with Individual Fullscreen & Remove */
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[270px] overflow-y-auto p-0.5 pr-1 no-scrollbar">
                      {images.map((img, idx) => (
                        <div
                          key={idx}
                          onClick={() => openFullscreenAt(idx)}
                          className="relative h-24 sm:h-28 rounded-xl overflow-hidden group cursor-pointer border border-black/10 dark:border-white/10 shadow-xs hover:shadow-md transition-all bg-black/10"
                        >
                          <img
                            src={img}
                            alt={`Photo ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />

                          {/* Cover Badge for First Image */}
                          {idx === 0 && (
                            <span className="absolute top-1.5 left-1.5 z-10 px-1.5 py-0.5 rounded-md bg-stone-900/80 text-white text-[10px] font-semibold backdrop-blur-xs select-none">
                              Cover
                            </span>
                          )}

                          {/* Image Index Indicator */}
                          <span className="absolute bottom-1.5 left-1.5 z-10 px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-medium backdrop-blur-xs select-none">
                            {idx + 1}
                          </span>

                          {/* Hover View Fullscreen Overlay */}
                          <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-200 backdrop-blur-[1px]">
                            <div className="flex flex-col items-center">
                              <ZoomIn className="!text-[22px]" />
                              <span className="text-[10px] font-medium tracking-tight">
                                Full screen
                              </span>
                            </div>
                          </div>

                          {/* Remove Single Photo Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(idx);
                            }}
                            className="absolute top-1.5 right-1.5 z-20 w-6 h-6 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-150 cursor-pointer"
                            title="Remove photo"
                            aria-label={`Remove photo ${idx + 1}`}
                          >
                            <Close className="!text-[13px]" />
                          </button>
                        </div>
                      ))}

                      {/* "+ Add photo" tile if slots remain */}
                      {images.length < MAX_IMAGES_PER_NOTE && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className={`h-24 sm:h-28 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-2 text-center transition-all cursor-pointer ${
                            isDark
                              ? "border-white/20 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white"
                              : "border-black/15 bg-black/[0.03] hover:bg-black/[0.06] text-stone-700 hover:text-stone-900"
                          }`}
                        >
                          <AddPhotoAlternateOutlined className="!text-xl mb-1 opacity-70" />
                          <span className="text-[11px] font-semibold leading-tight">
                            Add photo
                          </span>
                          <span className="text-[10px] opacity-60 mt-0.5">
                            {MAX_IMAGES_PER_NOTE - images.length} left
                          </span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Dropzone / Upload Picker when no images attached */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 flex flex-col items-center justify-center text-center transition-all ${
                    isDark
                      ? "border-white/25 bg-white/5 hover:bg-white/10 text-white"
                      : "border-black/15 bg-black/[0.03] hover:bg-black/[0.06] text-stone-800"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2.5 ${
                      isDark ? "bg-white/15 text-white" : "bg-black/5 text-stone-800"
                    }`}
                  >
                    <ImageOutlined className="!text-2xl" />
                  </div>
                  <p className="text-sm font-semibold mb-0.5">
                    Drop photos here, or browse files
                  </p>
                  <p
                    className={`text-xs mb-3 ${
                      isDark ? "text-white/60" : "text-stone-500"
                    }`}
                  >
                    Select up to 10 photos · Pick multiple files · Drag & drop · Paste
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                        isDark
                          ? "bg-white text-stone-900 hover:bg-white/90"
                          : "bg-stone-900 text-white hover:bg-stone-800"
                      }`}
                    >
                      <FolderOpenOutlined className="!text-sm" />
                      <span>Pick photos</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowUrlInput(!showUrlInput);
                      }}
                      className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all border cursor-pointer ${
                        isDark
                          ? "border-white/20 text-white hover:bg-white/10"
                          : "border-black/15 text-stone-700 hover:bg-black/5"
                      }`}
                    >
                      <LinkOutlined className="!text-sm inline mr-1" />
                      <span>URL</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Optional URL input toggle when 0 images */}
              {showUrlInput && images.length === 0 && (
                <div className="flex items-center gap-2 pt-1">
                  <InputBase
                    value={urlInputValue}
                    onChange={(e) => setUrlInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddUrl();
                      }
                    }}
                    placeholder="Paste image link (https://...) and press Enter"
                    className={`!w-full !text-xs !rounded-xl !px-3 !py-2 border transition-all ${
                      isDark
                        ? "!bg-black/20 !text-white border-white/20 placeholder:!text-white/50"
                        : "!bg-black/[0.04] !text-stone-900 border-black/10 placeholder:!text-stone-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleAddUrl}
                    className={`h-8 px-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      isDark
                        ? "bg-white text-stone-900 hover:bg-white/90"
                        : "bg-stone-900 text-white hover:bg-stone-800"
                    }`}
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Title Input */}
          <div className="pt-1">
            <InputBase
              id="note-title-input"
              value={title}
              onChange={({ target: { value } }) => setTitle(value)}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  handleNextInput();
                }
              }}
              placeholder={type === "photo" ? "Photo Title..." : "Title..."}
              autoFocus={!isUpdating && type === "text"}
              className={`!w-full !text-2xl sm:!text-[26px] !font-bold !tracking-tight ${
                isDark
                  ? "!text-white placeholder:!text-white/45"
                  : "!text-stone-900 placeholder:!text-stone-500/60"
              }`}
            />
            {/* Note Date and Time Subtitle */}
            {(noteDate || noteTime) && (
              <div className="mt-1 flex items-center">
                <Tooltip
                  arrow
                  placement="bottom-start"
                  enterDelay={100}
                  leaveDelay={100}
                  componentsProps={{
                    tooltip: {
                      className:
                        "!bg-stone-900/95 dark:!bg-stone-800/95 !backdrop-blur-xl !text-white !py-2.5 !px-3.5 !rounded-2xl !shadow-2xl !border !border-white/10 !min-w-[220px]",
                    },
                    arrow: {
                      className: "!text-stone-900/95 dark:!text-stone-800/95",
                    },
                  }}
                  title={
                    <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 items-center py-0.5 text-xs font-normal">
                      <span className="text-white/60 font-medium whitespace-nowrap">Created</span>
                      <span className="font-semibold text-white/95 whitespace-nowrap tabular-nums text-left">
                        {createdDisplay}
                      </span>
                      <div className="col-span-2 h-[1px] bg-white/10 w-full" />
                      <span className="text-white/60 font-medium whitespace-nowrap">Last modified</span>
                      <span className="font-semibold text-white/95 whitespace-nowrap tabular-nums text-left">
                        {modifiedDisplay}
                      </span>
                    </div>
                  }
                >
                  <span
                    className={`text-xs font-medium tracking-normal cursor-default select-none transition-colors ${
                      isDark
                        ? "text-white/60 hover:text-white/90"
                        : "text-stone-500 hover:text-stone-800"
                    }`}
                  >
                    {isUpdating
                      ? isEdited
                        ? `Edited ${modifiedDisplay}`
                        : `Created ${createdDisplay}`
                      : [noteDate, noteTime].filter(Boolean).join(" · ")}
                  </span>
                </Tooltip>
              </div>
            )}
          </div>

          {/* Description & Content Input */}
          <div className="flex-1 min-h-[140px]">
            <InputBase
              id="note-content-input"
              value={content}
              onChange={({ target: { value } }) => setContent(value)}
              placeholder={
                type === "photo"
                  ? "Write a description or details for this photo..."
                  : "Take a note, write ideas, thoughts..."
              }
              multiline
              minRows={5}
              maxRows={14}
              className={`!w-full !text-sm sm:!text-[15px] !leading-relaxed ${
                isDark
                  ? "!text-white/95 placeholder:!text-white/40"
                  : "!text-stone-800 placeholder:!text-stone-500/60"
              }`}
            />
          </div>

          {/* Tag Line */}
          <div className="pt-2 w-full">
            <div
              className={`min-h-[36px] py-1.5 w-full flex items-center gap-2 px-3.5 rounded-2xl backdrop-blur-md border transition-all ${
                isDark
                  ? "bg-black/20 border-white/10 text-white focus-within:border-white/30"
                  : "bg-black/[0.05] border-black/10 text-stone-800 focus-within:border-black/25"
              }`}
            >
              <span
                className={`text-xs font-semibold shrink-0 select-none leading-[20px] ${
                  isDark ? "text-white/60" : "text-stone-500"
                }`}
              >
                Tag:
              </span>
              <InputBase
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="#work, #ideas..."
                multiline
                maxRows={3}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                  }
                }}
                className={`!text-xs !w-full flex-1 !p-0 ${
                  isDark
                    ? "!text-white placeholder:!text-white/40"
                    : "!text-stone-800 placeholder:!text-stone-400"
                }`}
                inputProps={{
                  className: "!p-0 !m-0 !leading-[20px] !text-xs",
                  style: { padding: 0, margin: 0, lineHeight: "20px" },
                }}
              />
            </div>
          </div>
        </DialogContent>

        {/* Modal Bottom Actions */}
        <div className="px-6 pb-5 pt-2 flex items-center justify-between w-full">
          {isUpdating ? (
            <Button
              variant="text"
              onClick={deleteNoteHandler}
              startIcon={<DeleteOutline className="!text-[18px]" />}
              className={`!h-9 !px-4 !rounded-full !text-sm !font-medium !capitalize transition-colors ${
                confirmDelete
                  ? "!bg-red-500 !text-white shadow-sm"
                  : isDark
                  ? "!bg-white/10 hover:!bg-red-500/20 !text-white/80 hover:!text-red-200"
                  : "!bg-black/[0.05] hover:!bg-red-500/10 !text-stone-700 hover:!text-red-600"
              }`}
            >
              {confirmDelete ? "Click again to delete" : "Delete note"}
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button
              variant="text"
              onClick={() => dispatch(modalActions.hideModal())}
              className={`!h-9 !px-5 !rounded-full !text-sm !font-medium !capitalize transition-colors ${
                isDark
                  ? "!text-white/80 hover:!text-white hover:!bg-white/10"
                  : "!text-stone-700 hover:!text-stone-900 hover:!bg-black/5"
              }`}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={saveNoteHandler}
              className={`!h-9 !px-6 !rounded-full !text-sm !font-semibold !shadow-none hover:!shadow-sm transition-all !capitalize ${
                isDark
                  ? "!bg-white !text-stone-900 hover:!bg-white/90"
                  : "!bg-stone-900 !text-white hover:!bg-stone-800"
              }`}
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    </Dialog>

      {/* Fullscreen Lightbox / Viewer Modal */}
      <FullscreenImageViewer
        images={images}
        initialIndex={fullscreenIndex}
        open={fullscreenOpen}
        onClose={() => setFullscreenOpen(false)}
        onDeleteImage={handleRemoveImage}
      />
    </>
  );
};

export default NoteModal;
