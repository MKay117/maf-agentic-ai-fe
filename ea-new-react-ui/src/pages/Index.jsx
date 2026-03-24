// import { useState } from "react";
// import Box from "@mui/material/Box";
// import Header from "@/components/Header";
// import Sidebar from "@/components/Sidebar";
// import MainContentArea from "@/components/MainContentArea";

// const Index = () => {
//   const [selectedSession, setSelectedSession] = useState(null);

//   const handleNewChat = () => {
//     setSelectedSession(null);
//   };

//   const handleSessionSelect = (session) => {
//     setSelectedSession(session);
//   };

//   const handleSessionCreated = (id) => {
//     // Updates ID without unmounting the component, preserving the "Scores" state
//     setSelectedSession((prev) => ({ ...prev, session_id: id }));
//   };

//   return (
//     <Box
//       sx={{
//         height: "100vh",
//         display: "flex",
//         flexDirection: "column",
//         overflow: "hidden",
//       }}
//     >
//       <Header />

//       <Box
//         sx={{
//           flex: 1,
//           display: "flex",
//           minHeight: 0,
//           overflow: "hidden",
//         }}
//       >
//         <Sidebar
//           selectedSession={selectedSession}
//           onSessionSelect={handleSessionSelect}
//           onNewChat={handleNewChat}
//         />

//         <Box sx={{ flex: 1, overflow: "hidden" }}>
//           <MainContentArea
//             sessionId={selectedSession?.session_id}
//             sessionData={selectedSession}
//             onSessionCreated={handleSessionCreated}
//           />
//         </Box>
//       </Box>
//     </Box>
//   );
// };

// export default Index;

import { useState } from "react";
import Box from "@mui/material/Box";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MainContentArea from "@/components/MainContentArea";

const Index = () => {
  const [selectedSession, setSelectedSession] = useState(null);

  // NEW: Triggers a refresh in Sidebar when changed
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleNewChat = () => {
    setSelectedSession(null);
  };

  const handleSessionSelect = (session) => {
    setSelectedSession(session);
  };

  const handleSessionCreated = (id) => {
    // 1. Update the view to the new session
    setSelectedSession({ session_id: id });
    // 2. Increment trigger to force Sidebar to reload list
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Header />

      <Box
        sx={{
          flex: 1,
          display: "flex",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <Sidebar
          selectedSession={selectedSession}
          onSessionSelect={handleSessionSelect}
          onNewChat={handleNewChat}
          refreshTrigger={refreshTrigger} // PASS THE TRIGGER
        />

        <Box sx={{ flex: 1, overflow: "hidden" }}>
          <MainContentArea
            sessionId={selectedSession?.session_id}
            onSessionCreated={handleSessionCreated}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Index;
