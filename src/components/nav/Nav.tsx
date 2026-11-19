"use client";

import React, { useEffect, useState } from "react";
import { IconButton } from "@mui/material";
import {
  DarkModeOutlined,
  LightModeOutlined,
} from "@mui/icons-material";
import { themeActions } from "@/store/Theme";
import { useAppDispatch, useAppSelector } from "@/store/Index";
import { formatNavHeaderDate } from "@/lib/dateTime";

const Nav: React.FC = () => {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector((state) => state.theme.isDarkMode);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const switchTheme = () => {
    dispatch(themeActions.toggleTheme());
  };

  return (
    <nav className="flex justify-between items-center max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
      <h1 className="flex items-baseline gap-2 sm:gap-2.5 min-w-0 select-none">
        <span className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 shrink-0">
          mori
        </span>
        <span className="text-stone-300 dark:text-stone-600 text-sm sm:text-base font-light shrink-0">
          ·
        </span>
        <span className="text-sm sm:text-base md:text-lg font-medium text-stone-500 dark:text-stone-400 tracking-tight truncate">
          {mounted ? formatNavHeaderDate(new Date()) : ""}
        </span>
      </h1>
      <div className="flex items-center gap-2 shrink-0">
        <IconButton
          id="switchBtn"
          onClick={switchTheme}
          aria-label="Switch Theme"
          className="!text-stone-700 dark:!text-stone-200 hover:!bg-stone-200/50 dark:hover:!bg-stone-800"
        >
          {mounted && isDarkMode ? (
            <DarkModeOutlined className="text-stone-200" />
          ) : (
            <LightModeOutlined className="text-stone-800" />
          )}
        </IconButton>
      </div>
    </nav>
  );
};

export default Nav;
