"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Close,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  DeleteOutline,
  CollectionsOutlined,
} from "@mui/icons-material";
import { Tooltip, IconButton } from "@mui/material";

interface FullscreenImageViewerProps {
  images: string[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
  onDeleteImage?: (index: number) => void;
  readOnly?: boolean;
}

const FullscreenImageViewer: React.FC<FullscreenImageViewerProps> = ({
  images,
  initialIndex = 0,
  open,
  onClose,
  onDeleteImage,
  readOnly = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const touchStartXRef = useRef<number | null>(null);

  useEffect(() => {
    if (open) {
      setCurrentIndex(Math.min(Math.max(0, initialIndex), Math.max(0, images.length - 1)));
      setIsZoomed(false);
    }
  }, [open, initialIndex, images.length]);

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrev = useCallback(() => {
    if (images.length <= 1) return;
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, handleNext, handlePrev]);

  // Handle touch swipes
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartXRef.current = null;
  };

  const handleDownload = () => {
    const currentUrl = images[currentIndex];
    if (!currentUrl) return;
    const link = document.createElement("a");
    link.href = currentUrl;
    link.download = `note-image-${currentIndex + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteCurrent = () => {
    if (onDeleteImage && images.length > 0) {
      onDeleteImage(currentIndex);
      if (images.length <= 1) {
        onClose();
      } else if (currentIndex >= images.length - 1) {
        setCurrentIndex(images.length - 2);
      }
    }
  };

  if (!open || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col justify-between bg-black/92 backdrop-blur-xl select-none animate-in fade-in duration-200"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Navigation Bar */}
      <div
        className="w-full flex items-center justify-between px-4 sm:px-6 py-4 z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Counter Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white text-xs font-semibold tracking-wide shadow-sm">
          <CollectionsOutlined className="!text-sm opacity-80" />
          <span>
            {currentIndex + 1} / {images.length}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom toggle */}
          <Tooltip title={isZoomed ? "Actual size" : "Fit to screen"} arrow>
            <button
              type="button"
              onClick={() => setIsZoomed(!isZoomed)}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all duration-150 border border-white/10"
              aria-label="Toggle zoom"
            >
              {isZoomed ? (
                <ZoomOut className="!text-[20px]" />
              ) : (
                <ZoomIn className="!text-[20px]" />
              )}
            </button>
          </Tooltip>

          {/* Download button */}
          <Tooltip title="Download image" arrow>
            <button
              type="button"
              onClick={handleDownload}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all duration-150 border border-white/10"
              aria-label="Download image"
            >
              <Download className="!text-[20px]" />
            </button>
          </Tooltip>

          {/* Delete button (if not readonly) */}
          {!readOnly && onDeleteImage && (
            <Tooltip title="Remove this photo" arrow>
              <button
                type="button"
                onClick={handleDeleteCurrent}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-red-500/80 text-white flex items-center justify-center transition-all duration-150 border border-white/10"
                aria-label="Remove image"
              >
                <DeleteOutline className="!text-[20px]" />
              </button>
            </Tooltip>
          )}

          {/* Close button */}
          <Tooltip title="Close (Esc)" arrow>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all duration-150 border border-white/15 ml-1"
              aria-label="Close full screen viewer"
            >
              <Close className="!text-[20px]" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Main Image Viewer Stage */}
      <div
        className="relative flex-1 flex items-center justify-center px-4 overflow-hidden"
        onClick={onClose}
      >
        {/* Previous Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-3 sm:left-6 z-20 w-11 h-11 rounded-full bg-black/50 hover:bg-white/20 text-white flex items-center justify-center transition-all duration-150 backdrop-blur-md border border-white/15 shadow-lg active:scale-95"
            aria-label="Previous photo"
          >
            <ChevronLeft className="!text-[28px]" />
          </button>
        )}

        {/* Center Image */}
        <div
          className="relative max-w-full max-h-full flex items-center justify-center transition-all duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            key={currentImage}
            src={currentImage}
            alt={`Photo ${currentIndex + 1} of ${images.length}`}
            className={`transition-all duration-200 select-none object-contain rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] ${
              isZoomed
                ? "max-h-none max-w-none cursor-zoom-out scale-125"
                : "max-h-[75vh] max-w-[90vw] cursor-zoom-in"
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
            draggable={false}
          />
        </div>

        {/* Next Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-3 sm:right-6 z-20 w-11 h-11 rounded-full bg-black/50 hover:bg-white/20 text-white flex items-center justify-center transition-all duration-150 backdrop-blur-md border border-white/15 shadow-lg active:scale-95"
            aria-label="Next photo"
          >
            <ChevronRight className="!text-[28px]" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {images.length > 1 && (
        <div
          className="w-full flex items-center justify-center py-4 px-6 z-20 bg-gradient-to-t from-black/85 via-black/50 to-transparent"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 max-w-full overflow-x-auto py-1 px-2 no-scrollbar">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setCurrentIndex(idx);
                  setIsZoomed(false);
                }}
                className={`relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-200 border-2 ${
                  idx === currentIndex
                    ? "border-white ring-2 ring-white/60 scale-105 opacity-100 shadow-md"
                    : "border-transparent opacity-50 hover:opacity-90 hover:scale-100"
                }`}
                aria-label={`Jump to photo ${idx + 1}`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FullscreenImageViewer;
