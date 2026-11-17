"use client";

import React, { useEffect, useState } from "react";
import { IconButton } from "@mui/material";
import { DarkModeOutlined, LightModeOutlined } from "@mui/icons-material";
import { themeActions } from "@/store/Theme";
import { useAppDispatch, useAppSelector } from "@/store/Index";

const Nav: React.FC = () => {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector((state) => state.theme.isDarkMode);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (isDarkMode) {
      root.classList.add("dark");
      body.classList.add("darkMode", "dark");
    } else {
      root.classList.remove("dark");
      body.classList.remove("darkMode", "dark");
    }
  }, [isDarkMode]);

  const switchTheme = () => {
    dispatch(themeActions.toggleTheme());
  };

  const formatter = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <nav className="flex justify-between items-center mx-8 my-0 py-2">
      <p className="text-[2rem] font-normal inline-block select-none">
        {mounted ? formatter.format(new Date()) : ""}
      </p>
      <IconButton
        id="switchBtn"
        onClick={switchTheme}
        aria-label="Switch Theme"
        className="text-inherit"
      >
        {isDarkMode ? (
          <DarkModeOutlined className="text-white" />
        ) : (
          <LightModeOutlined className="text-[#212121]" />
        )}
      </IconButton>
    </nav>
  );
};

export default Nav;
