// src/pages/Index.jsx
import { useState } from "react";
import Box from "@mui/material/Box";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MainContentArea from "@/components/MainContentArea";

const Index = () => {
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  const handleNewChat = () => setSelectedSessionId(null);
  const handleSessionCreated = (id) => setSelectedSessionId(id);

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden", // no page scroll
      }}
    >
      {/* Header: now part of the flex layout */}
      <Header />

      {/* Row: sidebar + main content */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          minHeight: 0, // IMPORTANT: allows children to shrink & scroll inside
          overflow: "hidden",
        }}
      >
        <Sidebar
          selectedSessionId={selectedSessionId}
          onSessionSelect={setSelectedSessionId}
          onNewChat={handleNewChat}
        />

        {/* Wrap main so we can hide outer scroll and scroll inside only */}
        <Box sx={{ flex: 1, overflow: "hidden" }}>
          <MainContentArea
            sessionId={selectedSessionId}
            onSessionCreated={handleSessionCreated}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Index;
