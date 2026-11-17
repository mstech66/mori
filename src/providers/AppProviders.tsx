"use client";

import React, { ReactNode } from "react";
import { Provider } from "react-redux";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import store from "@/store/Index";

const muiTheme = createTheme({
  palette: {
    primary: {
      main: "#eddd58",
    },
    secondary: {
      main: "#212121",
    },
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "&.Mui-focused": {
            border: "1px solid green !important",
          },
        },
      },
    },
  },
});

interface AppProvidersProps {
  children: ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <Provider store={store}>
      <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>
    </Provider>
  );
}
