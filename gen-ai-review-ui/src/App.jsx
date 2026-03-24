import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline, Box } from "@mui/material";

import Header from "./components/Header";
import PrivateRoute from "./components/PrivateRoute";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";

const lightCorporateTheme = createTheme({
  palette: {
    mode: "light",
    background: { default: "#f4f6f8", paper: "#ffffff" },
    primary: { main: "#002edc" }, // Yes Bank Blue
    secondary: { main: "#f0f2f5" },
    text: { primary: "#1a202c", secondary: "#4a5568" },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    button: { textTransform: "none" },
  },
});

const ProtectedLayout = ({ children }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      overflow: "hidden",
    }}
  >
    <Header />
    <Box sx={{ flexGrow: 1, overflow: "hidden" }}>{children}</Box>
  </Box>
);

function App() {
  return (
    <ThemeProvider theme={lightCorporateTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <ProtectedLayout>
                  <Dashboard />
                </ProtectedLayout>
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
