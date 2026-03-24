import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";

// Basic default theme to replace the Context
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0014F5", // Yes Bank Blue
    },
    secondary: {
      main: "#d32f2f", // Red accent
    },
    background: {
      default: "#FCF8F8",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
