// import { useState, useEffect, useRef } from "react";
// import {
//   Container,
//   Box,
//   Paper,
//   Typography,
//   LinearProgress,
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
// } from "@mui/material";
// import { FileSearch } from "lucide-react";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import LightbulbOutlineIcon from "@mui/icons-material/LightbulbOutline";
// import LightbulbIcon from "@mui/icons-material/Lightbulb";

// // --- Custom Components ---
// import ChatInputWithUploads from "./ChatInputWithUploads";
// import FailureView from "./Review/FailureView";
// import MarkdownText from "./MarkdownText";
// import ReviewHeader from "./Review/ReviewHeader";
// import QualityMetricsModal from "./Review/QualityMetricsModal";

// // --- Service ---
// import { streamStandardReview } from "@/services/AgenticService";
// import { getSession } from "@/services/AgenticService";

// const StandardReviewContentArea = ({ sessionId, onSessionCreated }) => {
//   // --- STATE: UI CONTROL ---
//   const [isStreaming, setIsStreaming] = useState(false);
//   const [displayedContent, setDisplayedContent] = useState(""); // Raw text for streaming view
//   const [error, setError] = useState(null);
//   const [statusMessage, setStatusMessage] = useState("");

//   // --- STATE: FINAL REPORT DATA ---
//   const [finalReport, setFinalReport] = useState(null); // The structured dictionary from BE
//   const [scores, setScores] = useState(null);
//   const [executiveSummary, setExecutiveSummary] = useState([]);
//   const [reviewId, setReviewId] = useState("");

//   // --- STATE: INTERACTION ---
//   const [graphOpen, setGraphOpen] = useState(false);
//   const [expandedPanel, setExpandedPanel] = useState(false); // Controls Accordions

//   // --- REFS FOR TYPEWRITER EFFECT (BUFFERING) ---
//   const fullContentRef = useRef("");
//   const typedIndexRef = useRef(0);
//   const bottomRef = useRef(null);

//   // --- RESET LOGIC ---
//   useEffect(() => {
//     if (!sessionId) {
//       // Reset UI States
//       setIsStreaming(false);
//       setDisplayedContent("");
//       setError(null);
//       setStatusMessage("");

//       // Reset Data States
//       setFinalReport(null);
//       setScores(null);
//       setExecutiveSummary([]);
//       setReviewId("");
//       setExpandedPanel(false);

//       // Reset Buffers
//       fullContentRef.current = "";
//       typedIndexRef.current = 0;
//     }
//   }, [sessionId]);

//   // --- TYPEWRITER EFFECT HOOK (Only runs during streaming) ---
//   useEffect(() => {
//     // Stop the typewriter if we have the final report (view switched)
//     if (finalReport) return;

//     const intervalId = setInterval(() => {
//       const fullText = fullContentRef.current;
//       const currentIndex = typedIndexRef.current;

//       if (currentIndex < fullText.length) {
//         const backlog = fullText.length - currentIndex;
//         let charsToAdd = 1;

//         // Dynamic speed based on backlog
//         if (backlog > 200) charsToAdd = 50;
//         else if (backlog > 50) charsToAdd = 10;
//         else if (backlog > 10) charsToAdd = 3;

//         const nextChunk = fullText.slice(
//           currentIndex,
//           currentIndex + charsToAdd,
//         );
//         setDisplayedContent((prev) => prev + nextChunk);
//         typedIndexRef.current += charsToAdd;
//       }
//     }, 15);

//     return () => clearInterval(intervalId);
//   }, [finalReport]);

//   // --- HANDLERS ---

//   // const handleSend = async (message, attachments) => {
//   //   // 1. Initialize Streaming Mode
//   //   setIsStreaming(true);
//   //   setDisplayedContent("");
//   //   setFinalReport(null); // Clear previous final report
//   //   fullContentRef.current = "";
//   //   typedIndexRef.current = 0;
//   //   setError(null);
//   //   setStatusMessage("Initializing...");

//   //   const excel = attachments[0];

//   //   try {
//   //     await streamStandardReview(
//   //       { file: excel.fileObj, textprompt: message },
//   //       {
//   //         onStage: (data) => setStatusMessage(data?.message || "Processing..."),
//   //         onData: (d) => {
//   //           // Live Streaming: Update buffer for Typewriter
//   //           setStatusMessage("Generating Review...");
//   //           fullContentRef.current += d?.text || "";
//   //         },
//   //         onFinal: (data) => {
//   //           // 2. Final Data Received: Switch to Accordion View
//   //           setReviewId(data.review_id);
//   //           setScores(data.scores);
//   //           setExecutiveSummary(data.executive_summary || []);
//   //           setFinalReport(data.full_report); // Triggers view switch

//   //           setIsStreaming(false);
//   //           setStatusMessage("");

//   //           // Notify parent
//   //           if (data?.session_id && onSessionCreated) {
//   //             onSessionCreated(data.session_id);
//   //           }
//   //         },
//   //         onError: (e) => {
//   //           setError(e);
//   //           setIsStreaming(false);
//   //           setStatusMessage("");
//   //         },
//   //       },
//   //     );
//   //   } catch (err) {
//   //     setError(err);
//   //     setIsStreaming(false);
//   //   }
//   // };

//   const handleSend = async (message, attachments) => {
//     setIsStreaming(true);
//     setDisplayedContent("");
//     setFinalReport(null);
//     fullContentRef.current = "";
//     typedIndexRef.current = 0;
//     setError(null);
//     setStatusMessage("Initializing...");

//     const formData = new FormData();

//     // Attach the file (if provided)
//     if (attachments.length > 0) {
//       const file = attachments[0];
//       formData.append("file", file.fileObj);
//     }

//     // Attach the user prompt as JSON payload
//     if (message) {
//       formData.append("json_payload", JSON.stringify({ textprompt: message }));
//     }

//     try {
//       await streamStandardReview(formData, {
//         onStage: (data) => {
//           console.log("Stage Update:", data);
//           setStatusMessage(data?.message || "Processing...");
//         },
//         onData: (d) => {
//           console.log("Streaming Data:", d);
//           setStatusMessage("Generating Review...");
//           fullContentRef.current += d?.text || "";
//         },
//         onFinal: (data) => {
//           console.log("Final Data Received:", data);
//           setReviewId(data.review_id);
//           setScores(data.scores);
//           setExecutiveSummary(data.executive_summary || []);
//           setFinalReport(data.full_report);
//           setIsStreaming(false);
//           setStatusMessage("");

//           if (data?.session_id && onSessionCreated) {
//             onSessionCreated(data.session_id);
//           }
//         },
//         onError: (e) => {
//           console.error("Streaming Error:", e);
//           setError(e);
//           setIsStreaming(false);
//           setStatusMessage("");
//         },
//       });
//     } catch (err) {
//       console.error("Request Failed:", err);
//       setError(err);
//       setIsStreaming(false);
//     }
//   };

//   const handleAccordionChange = (panel) => (event, isExpanded) => {
//     setExpandedPanel(isExpanded ? panel : false);
//   };

//   // Auto-scroll logic (Mostly for streaming phase)
//   useEffect(() => {
//     if (
//       (isStreaming || displayedContent) &&
//       bottomRef.current &&
//       !finalReport
//     ) {
//       bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
//     }
//   }, [displayedContent, isStreaming, finalReport]);

//   // --- LAYOUT CONSTANTS ---
//   const pageTitle = "Standard Architecture Review";
//   const pageDesc = "Upload Excel workbook and Architecture diagrams";

//   // Show results if: Streaming OR Error OR We have a Final Report
//   const showResults = isStreaming || error || finalReport;

//   // Derive similarity score for Header (using Accuracy as proxy or 0)
//   const similarityScore = scores?.accuracy ? scores.accuracy * 10 : 0;

//   return (
//     <Container
//       sx={{
//         display: "flex",
//         flexDirection: "column",
//         height: "100%",
//         py: 2,
//         overflow: "hidden",
//       }}
//     >
//       {/* =========================================================
//           MODE 1: INITIAL STATE (Empty State + Input)
//          ========================================================= */}
//       {!showResults && (
//         <>
//           <Box
//             sx={{
//               flex: 1,
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               justifyContent: "center",
//               opacity: 0.8,
//             }}
//           >
//             <Box
//               sx={{
//                 width: 80,
//                 height: 80,
//                 borderRadius: "50%",
//                 bgcolor: "#f5f5f5",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 mb: 3,
//               }}
//             >
//               <FileSearch size={40} color="#333" />
//             </Box>
//             <Typography variant="h4" fontWeight={600} color="#000" gutterBottom>
//               {pageTitle}
//             </Typography>
//             <Typography variant="body1" color="text.secondary">
//               {pageDesc}
//             </Typography>
//           </Box>

//           <Box sx={{ width: "80%", mx: "auto", mb: 4 }}>
//             <ChatInputWithUploads
//               onSend={handleSend}
//               mode="standard"
//               allowedTypes=".json, .xlsx,.xls,.png,.jpg,.jpeg,.webp"
//               disabled={false}
//             />
//           </Box>
//         </>
//       )}

//       {/* =========================================================
//           MODE 2: RESULTS VIEW
//          ========================================================= */}
//       {showResults && (
//         <>
//           {/* Status Bar (Only when streaming) */}
//           {isStreaming && (
//             <Box sx={{ width: "100%", mt: 2, mb: 1 }}>
//               <LinearProgress />
//               {statusMessage && (
//                 <Typography
//                   variant="caption"
//                   color="primary"
//                   sx={{
//                     display: "block",
//                     mt: 1,
//                     fontWeight: 600,
//                     textAlign: "center",
//                   }}
//                 >
//                   STATUS: {statusMessage.toUpperCase()}
//                 </Typography>
//               )}
//             </Box>
//           )}

//           {error ? (
//             <FailureView
//               summary="Review Failed"
//               issues={[error.message || "Unknown error"]}
//             />
//           ) : (
//             <Box
//               sx={{
//                 flex: 1,
//                 overflowY: "auto", // Main scroll area
//                 pr: 1,
//                 mb: 2,
//                 pb: 4,
//               }}
//             >
//               {/* VIEW A: STREAMING (Typewriter Effect)
//                   Shown while data is generating, before final JSON arrives.
//               */}
//               {!finalReport && (
//                 <Paper variant="outlined" sx={{ p: 3 }}>
//                   <MarkdownText
//                     text={displayedContent || "Waiting for content..."}
//                   />
//                   <div ref={bottomRef} />
//                 </Paper>
//               )}

//               {/* VIEW B: FINAL REPORT (Accordions + Header)
//                   Shown only after 'onFinal' is triggered.
//               */}
//               {finalReport && (
//                 <>
//                   {/* 1. Header with Review ID & Summary */}
//                   <ReviewHeader
//                     reviewId={reviewId}
//                     reviewLoaded={true}
//                     isViewOnly={false}
//                     similarityScore={similarityScore}
//                     hasAgentScores={!!scores}
//                     onOpenGraph={() => setGraphOpen(true)}
//                     parsedExecutive={executiveSummary}
//                     title={pageTitle}
//                     description="AI-Generated Architecture Assessment"
//                     showExecutiveSummary={false}
//                   />

//                   {/* 2. Graph Modal */}
//                   <QualityMetricsModal
//                     open={graphOpen}
//                     onClose={() => setGraphOpen(false)}
//                     scores={scores}
//                   />

//                   {/* 3. Accordions (Controlled: Only 1 open) */}
//                   <Box>
//                     {Object.entries(finalReport).map(
//                       ([title, contentList], index) => {
//                         // Skip the "Executive" section in accordion if displayed in header?
//                         // The requirement said "4 sections and 4 accordions".
//                         // If Executive Summary is in header, we might have duplicate.
//                         // However, BE returns 5 sections usually. Let's render all from finalReport.
//                         // If contentList is empty or "AI Scorecard" (handled by modal), maybe skip?
//                         // For now, render exactly what BE sends in 'full_report'.

//                         // Skip Scorecard table from Accordions as it's in the Modal
//                         if (title.includes("Scorecard")) return null;

//                         return (
//                           // <Accordion
//                           //   key={index}
//                           //   expanded={expandedPanel === title}
//                           //   onChange={handleAccordionChange(title)}
//                           //   variant="outlined"
//                           //   // sx={{ mb: 1 }}
//                           // >
//                           //   <AccordionSummary expandIcon={<ExpandMoreIcon />}>
//                           //     <Typography fontWeight={600}>{title}</Typography>
//                           //   </AccordionSummary>
//                           //   <AccordionDetails>
//                           //     {/* Content is a List of Strings (Bullets) */}
//                           //     {Array.isArray(contentList) && (
//                           //       <ul style={{ paddingLeft: "20px", margin: 0 }}>
//                           //         {contentList.map((line, idx) => (
//                           //           <li
//                           //             key={idx}
//                           //             style={{ marginBottom: "4px" }}
//                           //           >
//                           //             {/* MarkdownText handles bold/italics inside the line */}
//                           //             <MarkdownText text={line} />
//                           //           </li>
//                           //         ))}
//                           //       </ul>
//                           //     )}
//                           //     {/* Fallback if it's just a string */}
//                           //     {!Array.isArray(contentList) && (
//                           //       <MarkdownText text={contentList} />
//                           //     )}
//                           //   </AccordionDetails>
//                           // </Accordion>
//                           <Accordion
//                             key={index}
//                             expanded={expandedPanel === title}
//                             onChange={handleAccordionChange(title)}
//                             variant="outlined"
//                           >
//                             <AccordionSummary expandIcon={<ExpandMoreIcon />}>
//                               <Box
//                                 sx={{
//                                   display: "flex",
//                                   alignItems: "center",
//                                   gap: 1,
//                                 }}
//                               >
//                                 {expandedPanel === title ? (
//                                   <LightbulbIcon
//                                     color="primary"
//                                     fontSize="small"
//                                     sx={{ transition: "color 0.2s ease" }}
//                                   />
//                                 ) : (
//                                   <LightbulbOutlineIcon
//                                     color="secondary"
//                                     fontSize="small"
//                                   />
//                                 )}

//                                 <Typography color="primary" fontWeight={600}>
//                                   {title}
//                                 </Typography>
//                               </Box>
//                             </AccordionSummary>

//                             <AccordionDetails>
//                               {Array.isArray(contentList) && (
//                                 <ul style={{ paddingLeft: "20px", margin: 0 }}>
//                                   {contentList.map((line, idx) => (
//                                     <li
//                                       key={idx}
//                                       style={{ marginBottom: "4px" }}
//                                     >
//                                       <MarkdownText text={line} />
//                                     </li>
//                                   ))}
//                                 </ul>
//                               )}

//                               {!Array.isArray(contentList) && (
//                                 <MarkdownText text={contentList} />
//                               )}
//                             </AccordionDetails>
//                           </Accordion>
//                         );
//                       },
//                     )}
//                   </Box>
//                 </>
//               )}
//             </Box>
//           )}
//         </>
//       )}
//     </Container>
//   );
// };

// export default StandardReviewContentArea;

import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Paper,
  IconButton,
  Grid,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";
import CircularProgress from "@mui/material/CircularProgress";

// The Magic Ingredients for Fluid Formatting
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  getAuthToken,
  isTokenExpired,
  handleSessionExpiry,
  getCurrentUser,
} from "../services/AuthService";

const API_BASE = "http://localhost:8000";

const StandardReviewContentArea = () => {
  const [file, setFile] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const [agentTexts, setAgentTexts] = useState({
    demographics: "",
    image_analyzer: "",
    general: "",
  });

  const [finalReport, setFinalReport] = useState(null);
  const fileInputRef = useRef();
  const bottomRef = useRef(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    } else {
      setError("Session expired. Please log in again.");
      handleSessionExpiry();
    }
  }, []);

  useEffect(() => {
    if (isStreaming && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [agentTexts, isStreaming]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleSend = async () => {
    if (!file) {
      setError("Please select an Excel or JSON file to upload.");
      return;
    }

    setIsStreaming(true);
    setFinalReport(null);
    setError(null);
    setStatusMessage("Initializing...");
    setAgentTexts({ demographics: "", image_analyzer: "", general: "" });

    const formData = new FormData();

    if (file.name.endsWith(".json")) {
      try {
        const text = await file.text();
        formData.append("json_payload", text);
      } catch (err) {
        setError("Failed to read JSON file.");
        setIsStreaming(false);
        return;
      }
    } else {
      formData.append("file", file);
    }

    if (isTokenExpired()) {
      handleSessionExpiry();
      setIsStreaming(false);
      return;
    }
    const token = getAuthToken();

    try {
      const res = await fetch(`${API_BASE}/review`, {
        method: "POST",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: formData,
      });

      if (!res.ok)
        throw new Error(`Server responded with status: ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        let sepIndex;

        while ((sepIndex = buffer.indexOf("\n\n")) !== -1) {
          const rawEvent = buffer.slice(0, sepIndex);
          buffer = buffer.slice(sepIndex + 2);

          if (!rawEvent.trim()) continue;

          const lines = rawEvent.split("\n");
          let eventName = "message";
          let dataText = "";

          lines.forEach((line) => {
            if (line.startsWith("event:")) eventName = line.slice(6).trim();
            if (line.startsWith("data:")) dataText += line.slice(5).trim();
          });

          if (!dataText) continue;

          let parsedData = {};
          try {
            parsedData = JSON.parse(dataText);
          } catch {
            parsedData = { text: dataText };
          }

          if (eventName === "stage_start") {
            setStatusMessage(`Running: ${parsedData.executor}...`);
          } else if (eventName === "stage_complete") {
            setStatusMessage(`Completed: ${parsedData.executor}`);
          } else if (eventName === "token") {
            const eid = parsedData.executor_id || "";
            const textChunk = parsedData.text || "";

            setAgentTexts((prev) => {
              const newState = { ...prev };
              if (eid.includes("demographics"))
                newState.demographics += textChunk;
              else if (eid.includes("image"))
                newState.image_analyzer += textChunk;
              else newState.general += textChunk;
              return newState;
            });
          } else if (eventName === "final") {
            setFinalReport(parsedData);
            setIsStreaming(false);
            setStatusMessage("Review Complete!");
          } else if (eventName === "error") {
            setError(parsedData.message || "Pipeline error occurred.");
            setIsStreaming(false);
            break;
          }
        }
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
      setIsStreaming(false);
    }
  };

  const handleLogout = () => {
    handleSessionExpiry();
    window.location.reload();
  };

  return (
    <Box
      sx={{
        padding: 4,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          MAF Architecture Review
        </Typography>
        {user && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Logged in as: <strong>{user.name}</strong> ({user.role})
            </Typography>
            <Button
              variant="outlined"
              size="small"
              color="secondary"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        )}
      </Box>

      <Paper
        sx={{ p: 2, mb: 3, display: "flex", alignItems: "center", gap: 2 }}
      >
        <input
          type="file"
          accept=".json,.xlsx,.xls"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <Button
          variant="outlined"
          startIcon={<AttachFileIcon />}
          onClick={() => fileInputRef.current.click()}
          disabled={isStreaming}
        >
          {file ? file.name : "Select Excel or JSON File"}
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={handleSend}
          disabled={isStreaming || !file}
          startIcon={
            isStreaming ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SendIcon />
            )
          }
        >
          {isStreaming ? "Analyzing..." : "Start Review"}
        </Button>
      </Paper>

      {isStreaming && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress />
          <Typography
            variant="caption"
            color="primary"
            sx={{ display: "block", mt: 1, fontWeight: "bold" }}
          >
            STATUS: {statusMessage.toUpperCase()}
          </Typography>
        </Box>
      )}

      {error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: "#ffebee" }}>
          <Typography color="error" fontWeight="bold">
            Error: {error}
          </Typography>
        </Paper>
      )}

      <Box sx={{ flexGrow: 1, overflowY: "auto", pr: 2 }}>
        {/* Live Streaming View */}
        {(isStreaming ||
          (!finalReport &&
            !error &&
            (agentTexts.demographics ||
              agentTexts.image_analyzer ||
              agentTexts.general))) && (
          <Box>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <Paper
                  variant="outlined"
                  sx={{ p: 2, minHeight: "200px", bgcolor: "#f8f9fa" }}
                >
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    📊 Demographics & RAG Agent
                  </Typography>
                  <Box
                    sx={{
                      fontFamily: "monospace",
                      whiteSpace: "pre-wrap",
                      fontSize: "0.85rem",
                      color: "#333",
                    }}
                  >
                    {agentTexts.demographics}
                    {isStreaming &&
                      statusMessage.includes("demographics") &&
                      " ▌"}
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper
                  variant="outlined"
                  sx={{ p: 2, minHeight: "200px", bgcolor: "#f8f9fa" }}
                >
                  <Typography
                    variant="subtitle2"
                    color="success.main"
                    gutterBottom
                  >
                    🖼️ Image Analyzer Agent
                  </Typography>
                  <Box
                    sx={{
                      fontFamily: "monospace",
                      whiteSpace: "pre-wrap",
                      fontSize: "0.85rem",
                      color: "#333",
                    }}
                  >
                    {agentTexts.image_analyzer}
                    {isStreaming && statusMessage.includes("image") && " ▌"}
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            {agentTexts.general && (
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  bgcolor: "#ffffff",
                  borderLeft: "4px solid #9c27b0",
                }}
              >
                <Typography variant="subtitle2" color="secondary" gutterBottom>
                  🛠️ Remediation & Formatting
                </Typography>

                {/* Fluid Markdown Parsing for Live Text */}
                <Box sx={{ "& p, & ul, & h1, & h2, & h3": { mt: 0, mb: 1 } }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {agentTexts.general +
                      (isStreaming &&
                      !statusMessage.includes("demographics") &&
                      !statusMessage.includes("image")
                        ? " ▌"
                        : "")}
                  </ReactMarkdown>
                </Box>
              </Paper>
            )}
          </Box>
        )}

        {/* Final Report View */}
        {finalReport && (
          <Paper
            variant="outlined"
            sx={{ p: 4, borderColor: "success.main", bgcolor: "#ffffff" }}
          >
            <Typography
              variant="h6"
              color="success.main"
              sx={{ mb: 3, pb: 1, borderBottom: "1px solid #eee" }}
            >
              ✅ Review Completed Successfully
            </Typography>

            {finalReport.final_markdown ? (
              // Fluid Markdown Parsing for the Final Result
              <Box
                sx={{
                  fontFamily: "sans-serif",
                  lineHeight: 1.6,
                  "& h1": {
                    fontSize: "1.5rem",
                    color: "#1976d2",
                    mt: 3,
                    mb: 1,
                  },
                  "& h2": { fontSize: "1.25rem", color: "#333", mt: 2, mb: 1 },
                  "& ul": { paddingLeft: "24px", mb: 2 },
                  "& li": { mb: 0.5 },
                  "& strong": { color: "#000" },
                }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {finalReport.final_markdown}
                </ReactMarkdown>
              </Box>
            ) : (
              // Fallback for Raw JSON
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: "#f5f5f5",
                  borderRadius: 1,
                  overflowX: "auto",
                }}
              >
                <pre style={{ margin: 0, fontSize: "12px", color: "#333" }}>
                  {JSON.stringify(finalReport, null, 2)}
                </pre>
              </Box>
            )}
          </Paper>
        )}

        <div ref={bottomRef} style={{ height: "40px" }} />
      </Box>
    </Box>
  );
};

export default StandardReviewContentArea;
