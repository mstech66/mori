"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/Index";
import { noteActions, DEFAULT_TAGS, normalizeTag } from "@/store/Note";

const TagChips: React.FC = () => {
  const dispatch = useAppDispatch();
  const notes = useAppSelector((state) => state.notes.notes);
  const selectedTag = useAppSelector((state) => state.notes.selectedTag) || "All";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Arrange tags by frequency of use:
  // "All" is always first.
  // The remaining tags are sorted descending by their number of occurrences in notes.
  // For ties, preserve the default curated tag order, then alphabetical.
  const tags = useMemo(() => {
    const tagCounts = new Map<string, number>();
    const tagDisplayMap = new Map<string, string>();

    // Seed with curated default tags (excluding "All")
    DEFAULT_TAGS.forEach((tag) => {
      if (tag.toLowerCase() === "all") return;
      const normalized = normalizeTag(tag);
      tagCounts.set(normalized, 0);
      tagDisplayMap.set(normalized, tag);
    });

    // Count tag usages across notes
    notes.forEach((note) => {
      if (!note.tag) return;
      const parts = note.tag
        .split(/[\s,;]+/)
        .map(normalizeTag)
        .filter(Boolean);

      // Prevent multiple counts for the same tag on a single note
      const uniqueInNote = new Set(parts);
      uniqueInNote.forEach((tagPart) => {
        tagCounts.set(tagPart, (tagCounts.get(tagPart) || 0) + 1);
        if (!tagDisplayMap.has(tagPart)) {
          const displayTag =
            tagPart.charAt(0).toUpperCase() + tagPart.slice(1);
          tagDisplayMap.set(tagPart, displayTag);
        }
      });
    });

    // Sort tags by frequency descending
    const sortedTags = Array.from(tagDisplayMap.keys()).sort((a, b) => {
      const countA = tagCounts.get(a) || 0;
      const countB = tagCounts.get(b) || 0;
      if (countB !== countA) {
        return countB - countA;
      }
      // Tie-breakers: DEFAULT_TAGS index first, then alphabetical
      const indexA = DEFAULT_TAGS.findIndex((t) => normalizeTag(t) === a);
      const indexB = DEFAULT_TAGS.findIndex((t) => normalizeTag(t) === b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });

    return ["All", ...sortedTags.map((key) => tagDisplayMap.get(key)!)];
  }, [notes]);

  const handleSelectTag = (tag: string) => {
    dispatch(noteActions.setSelectedTag(tag));
  };

  const displayTags = mounted ? tags : DEFAULT_TAGS;
  const currentSelectedTag = mounted ? selectedTag : "All";

  return (
    <div className="w-full flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar py-1 mb-6 sm:mb-8 gap-2 sm:gap-2.5 px-0.5 scroll-smooth select-none">
      {displayTags.map((tag) => {
        const isSelected =
          currentSelectedTag.toLowerCase() === tag.toLowerCase();

        return (
          <button
            key={tag}
            type="button"
            onClick={() => handleSelectTag(tag)}
            aria-pressed={isSelected}
            className={`shrink-0 px-4 py-1.5 rounded-full text-[13px] sm:text-[13.5px] font-medium tracking-tight transition-colors duration-150 ease-out cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 [-webkit-tap-highlight-color:transparent] ${
              isSelected
                ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                : "bg-[#e5e7e0] text-stone-800 hover:bg-[#dcdfd6] hover:text-stone-900 dark:bg-stone-800/80 dark:text-stone-300 dark:hover:bg-stone-700/90 dark:hover:text-stone-100"
            }`}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
};

export default TagChips;
