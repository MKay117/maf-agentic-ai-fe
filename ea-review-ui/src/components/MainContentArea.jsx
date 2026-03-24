// import { useState, useEffect, useMemo } from "react";
// import { FileSearch, Upload } from "lucide-react";
// import ChatInputWithUploads from "./ChatInputWithUploads";
// import {
//   postReview,
//   getSession,
//   streamReview,
// } from "@/services/AgenticService";

// import {
//   Snackbar,
//   Alert,
//   Container,
//   Paper,
//   Typography,
//   Box,
//   Stack,
//   LinearProgress,
// } from "@mui/material";

// // ------------------ Helpers -----------------------
// function camelToNormal(str) {
//   if (!str) return "";
//   return str
//     .replace(/_/g, " ")
//     .replace(/([a-z])([A-Z])/g, "$1 $2")
//     .replace(/\b\w/g, (c) => c.toUpperCase());
// }

// function getStatusColor(status) {
//   if (!status) return "text.primary";
//   const lower = status.toLowerCase();
//   if (lower.includes("started")) return "blue";
//   if (lower.includes("completed")) return "green";
//   if (lower.includes("success")) return "green";
//   return "red";
// }

// // ------------------ NEW PARSER -----------------------
// function parseSections(summary) {
//   if (!summary) return [];

//   // NEW REVIEW → summary is a string
//   let text =
//     typeof summary === "string"
//       ? summary
//       : typeof summary.summary === "string"
//       ? summary.summary
//       : null;

//   if (!text) return [];

//   const raw = text
//     .split(/\n\s*\n/)
//     .map((s) => s.trim())
//     .filter(Boolean);

//   return raw.map((section) => {
//     const lines = section.split("\n").map((l) => l.trim());

//     let title = "";
//     let bulletLines = [];

//     if (lines[0].startsWith("-")) {
//       bulletLines = lines.map((l) => l.replace(/^-/, "").trim());
//     } else {
//       title = lines[0] || "Section";
//       bulletLines = lines
//         .slice(1)
//         .filter((l) => l.startsWith("-"))
//         .map((l) => l.replace(/^-/, "").trim());
//     }

//     return { title, bullets: bulletLines };
//   });
// }

// // ------------------ Similarity Score -----------------------
// function extractSimilarityScore(summary) {
//   if (!summary) return null;

//   // NEW REVIEW → summary is a string
//   if (typeof summary === "string") {
//     const match = summary.match(/Overall similarity score.*?(\d+)%/i);
//     return match ? parseInt(match[1], 10) : null;
//   }

//   // LOADED SESSION → summary.summary is the string
//   if (typeof summary?.summary === "string") {
//     const match = summary.summary.match(/Overall similarity score.*?(\d+)%/i);
//     return match ? parseInt(match[1], 10) : null;
//   }

//   return null;
// }

// // ------------------ Main Component -----------------------
// const MainContentArea = ({ sessionId, onSessionCreated }) => {
//   const [sessionDetails, setSessionDetails] = useState(null);
//   const [loadingSession, setLoadingSession] = useState(false);
//   const [toast, setToast] = useState({
//     open: false,
//     severity: "info",
//     message: "",
//   });

//   const [streaming, setStreaming] = useState(false);
//   const [dots, setDots] = useState(".");
//   const [stageEvents, setStageEvents] = useState([]);

//   const [inputVisible, setInputVisible] = useState(true);
//   const [backendReview, setBackendReview] = useState(null);

//   const isViewOnly = Boolean(sessionId);

//   useEffect(() => {
//     // sessionId can be:
//     //  - null/undefined -> no selection
//     //  - string (legacy/new-review flow, e.g. "abc123")
//     //  - object { session_id, month, year, date } (sidebar flow)
//     const isStringId = typeof sessionId === "string" && sessionId.length > 0;
//     const isObjId =
//       sessionId && typeof sessionId === "object" && sessionId.session_id;

//     if (!isStringId && !isObjId) {
//       // no selection
//       setSessionDetails(null);
//       return;
//     }

//     const fetchSession = async () => {
//       setLoadingSession(true);
//       // when loading a new session ensure we stop showing backendReview
//       setBackendReview(null);
//       try {
//         let data = null;
//         if (isStringId) {
//           // simple legacy call: GET /logs/session?session_id=abc
//           data = await getSession(sessionId);
//         } else {
//           // object with detailed params: GET /logs/session?session_id=...&month=...&year=...&date=...
//           const { session_id, month, year, date } = sessionId;
//           data = await getSession(session_id, month, year, date);
//         }

//         // Normalise shape: backend might return raw JSON or { details: ... }
//         const normalized = data?.details ? data.details : data;
//         setSessionDetails(normalized || null);
//       } catch (err) {
//         console.error("Failed to load session:", err);
//         setToast({
//           open: true,
//           severity: "error",
//           message: "Failed to load session details.",
//         });
//         setSessionDetails(null);
//       } finally {
//         setLoadingSession(false);
//       }
//     };

//     fetchSession();
//   }, [sessionId]);

//   const activeEvent = useMemo(() => {
//     if (!stageEvents.length) return null;
//     return stageEvents[stageEvents.length - 1];
//   }, [stageEvents]);

//   // Animate dots
//   useEffect(() => {
//     if (!activeEvent || !streaming) return;

//     const id = setInterval(() => {
//       setDots((prev) => (prev.length < 5 ? prev + "." : "."));
//     }, 400);

//     return () => clearInterval(id);
//   }, [activeEvent, streaming]);

//   // ------------------ Handle Send -----------------------
//   const handleSend = async (message, attachments) => {
//     try {
//       setInputVisible(false);

//       const single = attachments?.[0] ?? null;
//       let metadataPayload;

//       if (single?.type?.includes("json")) {
//         metadataPayload = single.content;
//       } else if (
//         single &&
//         (single.type?.startsWith("image/") || single.type === "application/pdf")
//       ) {
//         metadataPayload = { arch_img_url: single.content };
//       } else if (single) {
//         metadataPayload = { text_content: single.content };
//       } else if (message?.trim()) {
//         metadataPayload = { text_content: message.trim() };
//       }

//       const payload = { metadata: metadataPayload };

//       setStreaming(true);
//       setStageEvents([]);
//       setBackendReview(null);
//       setSessionDetails(null);

//       postReview(payload)
//         .then((data) => data && setBackendReview(data))
//         .catch((err) => console.error("postReview failed:", err));

//       await streamReview(payload, {
//         onStage: (evt) => {
//           if (evt && evt.stage !== "agents_stage") {
//             setStageEvents((prev) => [...prev, evt]);
//           }
//         },
//         onFinal: async (result) => {
//           try {
//             if (result) setBackendReview(result);

//             const id = result?.session_id || result?.sessionId || null;

//             if (id) onSessionCreated?.(id);

//             if (id) {
//               setLoadingSession(true);
//               try {
//                 const data = await getSession(id);
//                 setSessionDetails(data);
//               } finally {
//                 setLoadingSession(false);
//               }
//             }

//             setToast({
//               open: true,
//               severity: "success",
//               message: "Review completed.",
//             });
//           } catch (e) {
//             console.error(e);
//             setToast({
//               open: true,
//               severity: "error",
//               message: "Error processing review.",
//             });
//           } finally {
//             setStreaming(false);
//           }
//         },
//         onError: (err) => {
//           console.error("streamError:", err);
//           setToast({
//             open: true,
//             severity: "error",
//             message: err.message || "Streaming error",
//           });
//           setStreaming(false);
//         },
//       });
//     } catch (err) {
//       console.error(err);
//       setToast({
//         open: true,
//         severity: "error",
//         message: "Failed to submit review.",
//       });
//       setStreaming(false);
//     }
//   };

//   // ------------------ Final review selection -----------------------
//   const isNewReview = Boolean(backendReview);
//   const review =
//     backendReview || sessionDetails?.details || sessionDetails || null;

//   let finalSummary = isNewReview
//     ? review?.summary || null
//     : review?.formatting_summary || review?.validation_result || null;

//   const similarityScore = extractSimilarityScore(finalSummary);
//   const reviewLoaded = Boolean(finalSummary || review?.review_id);
//   const sections = parseSections(finalSummary);

//   // ------------------ UI -----------------------
//   return (
//     <Container
//       sx={{
//         display: "flex",
//         flexDirection: "column",
//         height: "100%",
//         overflow: "hidden",
//         py: 3,
//       }}
//     >
//       <Box
//         sx={{
//           pb: 2,
//           width: "100%",
//           maxWidth: 900,
//           mx: "auto",
//           flex: 1,
//           overflowY: "auto",
//         }}
//       >
//         {/* Header */}
//         <Stack spacing={2} alignItems="center" sx={{ mb: 4 }}>
//           {!reviewLoaded && (
//             <>
//               <Box
//                 sx={{
//                   width: 64,
//                   height: 64,
//                   borderRadius: "50%",
//                   bgcolor: "#eee",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                 }}
//               >
//                 <FileSearch size={32} color="#053b8dff" />
//               </Box>

//               <Typography variant="h4">
//                 Enterprise Architecture Review
//               </Typography>

//               {!isViewOnly && (
//                 <Stack direction="row" spacing={1}>
//                   <Upload size={20} />
//                   <Typography color="text.secondary">
//                     Upload your architecture files for review
//                   </Typography>
//                 </Stack>
//               )}
//             </>
//           )}

//           {reviewLoaded && (
//             <Stack
//               direction="row"
//               justifyContent="space-between"
//               alignItems="center"
//               sx={{ width: "100%" }}
//             >
//               <Box>
//                 <Typography variant="h5" fontWeight={600}>
//                   Review Summary
//                 </Typography>
//                 {review?.review_id && (
//                   <Typography variant="body2" color="text.secondary">
//                     Review ID: {review.review_id}
//                   </Typography>
//                 )}
//               </Box>

//               {similarityScore != null && (
//                 <Box sx={{ width: 180 }}>
//                   <Typography
//                     variant="caption"
//                     color="text.secondary"
//                     gutterBottom
//                   >
//                     Similarity to Best-Practice
//                   </Typography>
//                   <LinearProgress
//                     variant="determinate"
//                     value={similarityScore}
//                   />
//                   <Typography variant="caption" color="text.secondary">
//                     {similarityScore}%
//                   </Typography>
//                 </Box>
//               )}
//             </Stack>
//           )}
//         </Stack>

//         {/* Loading indicator when switching sessions */}
//         {loadingSession && (
//           <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
//             <Typography variant="subtitle1" fontWeight={600}>
//               Loading session…
//             </Typography>
//             <Box sx={{ mt: 1 }}>
//               <LinearProgress />
//             </Box>
//           </Paper>
//         )}

//         {/* Streaming Progress */}
//         {streaming && (
//           <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
//             <Typography variant="subtitle1" fontWeight={600}>
//               Live Review Progress
//             </Typography>

//             {activeEvent ? (
//               <Box
//                 sx={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   alignItems: "center",
//                   width: "100%",
//                 }}
//               >
//                 <Typography
//                   variant="body2"
//                   sx={{
//                     fontWeight: 500,
//                     display: "flex",
//                     alignItems: "center",
//                   }}
//                 >
//                   {camelToNormal(activeEvent.stage)}
//                   <Box
//                     component="span"
//                     sx={{
//                       ml: 1,
//                       width: 20,
//                       display: "inline-block",
//                       textAlign: "left",
//                     }}
//                   >
//                     {dots}
//                   </Box>
//                 </Typography>

//                 <Typography
//                   variant="body2"
//                   sx={{
//                     color: getStatusColor(activeEvent.status),
//                     fontWeight: 600,
//                     ml: 2,
//                     whiteSpace: "nowrap",
//                   }}
//                 >
//                   {camelToNormal(activeEvent.status)}
//                 </Typography>
//               </Box>
//             ) : (
//               <Typography color="text.secondary">
//                 Waiting for updates…
//               </Typography>
//             )}
//           </Paper>
//         )}

//         {/* Summary Cards */}
//         {reviewLoaded &&
//           sections.map((sec, i) => (
//             <Paper
//               key={i}
//               variant="outlined"
//               sx={{
//                 p: 2,
//                 mb: 2,
//                 borderRadius: 3,
//                 border: "1px solid rgba(184, 185, 188, 0.4)", // soft border
//               }}
//             >
//               {/* Title */}
//               {sec.title && (
//                 <Typography variant="subtitle1" fontWeight={600} gutterBottom>
//                   {sec.title}
//                 </Typography>
//               )}

//               {/* Bullets */}
//               {sec.bullets.length > 0 ? (
//                 <ul style={{ marginTop: 4 }}>
//                   {sec.bullets.map((b, j) => (
//                     <li key={j}>
//                       <Typography sx={{ fontSize: 14 }}>{b}</Typography>
//                     </li>
//                   ))}
//                 </ul>
//               ) : (
//                 <Typography> No details provided. </Typography>
//               )}
//             </Paper>
//           ))}

//         {sessionId && !loadingSession && !reviewLoaded && (
//           <Typography textAlign="center" color="text.secondary">
//             Review for this session no longer exists.
//           </Typography>
//         )}
//       </Box>

//       {/* Input */}
//       {!isViewOnly && inputVisible && (
//         <Box sx={{ width: "70%", mx: "auto" }}>
//           <ChatInputWithUploads onSend={handleSend} disabled={streaming} />
//           <Typography
//             variant="caption"
//             color="text.secondary"
//             textAlign="center"
//             display="block"
//             mt={1}
//           >
//             * Supports JSON, TXT, PDF, DOCX, ZIP, and images
//           </Typography>
//         </Box>
//       )}

//       <Snackbar
//         open={toast.open}
//         autoHideDuration={4000}
//         onClose={() => setToast((p) => ({ ...p, open: false }))}
//       >
//         <Alert severity={toast.severity}>{toast.message}</Alert>
//       </Snackbar>
//     </Container>
//   );
// };

// export default MainContentArea;

import { useState, useEffect, useMemo } from "react";
import { FileSearch, Upload } from "lucide-react";
import ChatInputWithUploads from "./ChatInputWithUploads";
import { getSession, streamReview } from "@/services/AgenticService";
import {
  Snackbar,
  Alert,
  Container,
  Paper,
  Typography,
  Box,
  Stack,
  LinearProgress,
} from "@mui/material";

// ------------------ Helpers -----------------------
function camelToNormal(str) {
  if (!str) return "";
  return str
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getStatusColor(status) {
  if (!status) return "text.primary";
  const lower = status.toLowerCase();
  if (lower.includes("started")) return "blue";
  if (lower.includes("completed")) return "green";
  if (lower.includes("success")) return "green";
  return "red";
}

// ------------------ NEW PARSER -----------------------
function parseSections(summary) {
  if (!summary) return [];

  // NEW REVIEW → summary is a string
  let text =
    typeof summary === "string"
      ? summary
      : typeof summary.summary === "string"
      ? summary.summary
      : null;

  if (!text) return [];

  const raw = text
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  return raw.map((section) => {
    const lines = section.split("\n").map((l) => l.trim());

    let title = "";
    let bulletLines = [];

    if (lines[0].startsWith("-")) {
      bulletLines = lines.map((l) => l.replace(/^-/, "").trim());
    } else {
      title = lines[0] || "Section";
      bulletLines = lines
        .slice(1)
        .filter((l) => l.startsWith("-"))
        .map((l) => l.replace(/^-/, "").trim());
    }

    return { title, bullets: bulletLines };
  });
}

// ------------------ Similarity Score -----------------------
function extractSimilarityScore(summary) {
  if (!summary) return null;

  // NEW REVIEW → summary is a string
  if (typeof summary === "string") {
    const match = summary.match(/Overall similarity score.*?(\d+)%/i);
    return match ? parseInt(match[1], 10) : null;
  }

  // LOADED SESSION → summary.summary is the string
  if (typeof summary?.summary === "string") {
    const match = summary.summary.match(/Overall similarity score.*?(\d+)%/i);
    return match ? parseInt(match[1], 10) : null;
  }

  return null;
}

// ------------------ Main Component -----------------------
const MainContentArea = ({ sessionId, onSessionCreated }) => {
  const [sessionDetails, setSessionDetails] = useState(null);
  const [loadingSession, setLoadingSession] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    severity: "info",
    message: "",
  });

  const [streaming, setStreaming] = useState(false);
  const [dots, setDots] = useState(".");
  const [stageEvents, setStageEvents] = useState([]);

  const [inputVisible, setInputVisible] = useState(true);
  const [backendReview, setBackendReview] = useState(null);

  const isViewOnly = Boolean(sessionId);

  useEffect(() => {
    // sessionId can be:
    //  - null/undefined -> no selection
    //  - string (legacy/new-review flow, e.g. "abc123")
    //  - object { session_id, month, year, date } (sidebar flow)
    const isStringId = typeof sessionId === "string" && sessionId.length > 0;
    const isObjId =
      sessionId && typeof sessionId === "object" && sessionId.session_id;

    if (!isStringId && !isObjId) {
      // no selection
      setSessionDetails(null);
      return;
    }

    const fetchSession = async () => {
      setLoadingSession(true);
      // when loading a new session ensure we stop showing backendReview
      setBackendReview(null);
      try {
        let data = null;
        if (isStringId) {
          // simple legacy call: GET /logs/session?session_id=abc
          data = await getSession(sessionId);
        } else {
          // object with detailed params: GET /logs/session?session_id=...&month=...&year=...&date=...
          const { session_id, month, year, date } = sessionId;
          data = await getSession(session_id, month, year, date);
        }

        // Normalise shape: backend might return raw JSON or { details: ... }
        const normalized = data?.details ? data.details : data;
        setSessionDetails(normalized || null);
      } catch (err) {
        console.error("Failed to load session:", err);
        setToast({
          open: true,
          severity: "error",
          message: "Failed to load session details.",
        });
        setSessionDetails(null);
      } finally {
        setLoadingSession(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  const activeEvent = useMemo(() => {
    if (!stageEvents.length) return null;
    return stageEvents[stageEvents.length - 1];
  }, [stageEvents]);

  // Animate dots
  useEffect(() => {
    if (!activeEvent || !streaming) return;

    const id = setInterval(() => {
      setDots((prev) => (prev.length < 5 ? prev + "." : "."));
    }, 400);

    return () => clearInterval(id);
  }, [activeEvent, streaming]);

  // ------------------ Handle Send -----------------------
  const handleSend = async (message, attachments) => {
    try {
      setInputVisible(false);

      const single = attachments?.[0] ?? null;
      let metadataPayload;

      if (single?.type?.includes("json")) {
        metadataPayload = single.content;
      } else if (
        single &&
        (single.type?.startsWith("image/") || single.type === "application/pdf")
      ) {
        metadataPayload = { arch_img_url: single.content };
      } else if (single) {
        metadataPayload = { text_content: single.content };
      } else if (message?.trim()) {
        metadataPayload = { text_content: message.trim() };
      }

      const payload = { metadata: metadataPayload };

      // RESET STATE
      setStreaming(true);
      setStageEvents([]);
      setBackendReview(null);
      setSessionDetails(null);

      await streamReview(payload, {
        onStage: (evt) => {
          if (evt && evt.stage !== "agents_stage") {
            setStageEvents((prev) => [...prev, evt]);
          }
        },

        onFinal: async (result) => {
          try {
            if (result) setBackendReview(result);

            const id =
              result?.session_id ||
              result?.sessionId ||
              result?.review_id ||
              null;

            if (id) onSessionCreated?.(id);

            if (id) {
              setLoadingSession(true);
              try {
                const data = await getSession(id);
                setSessionDetails(data?.details || data);
              } finally {
                setLoadingSession(false);
              }
            }

            setToast({
              open: true,
              severity: "success",
              message: "Review completed.",
            });
          } catch (e) {
            console.error(e);
            setToast({
              open: true,
              severity: "error",
              message: "Error processing review.",
            });
          } finally {
            setStreaming(false);
          }
        },

        onError: (err) => {
          console.error("streamError:", err);
          setToast({
            open: true,
            severity: "error",
            message: err?.message || "Streaming error",
          });
          setStreaming(false);
        },
      });
    } catch (err) {
      console.error(err);
      setToast({
        open: true,
        severity: "error",
        message: "Failed to submit review.",
      });
      setStreaming(false);
    }
  };

  // ------------------ Final review selection -----------------------
  const isNewReview = Boolean(backendReview);
  const review =
    backendReview || sessionDetails?.details || sessionDetails || null;

  let finalSummary = isNewReview
    ? review?.summary || null
    : review?.formatting_summary || review?.validation_result || null;

  const similarityScore = extractSimilarityScore(finalSummary);
  const reviewLoaded = Boolean(finalSummary || review?.review_id);
  const sections = parseSections(finalSummary);

  // ------------------ UI -----------------------
  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        py: 3,
      }}
    >
      <Box
        sx={{
          pb: 2,
          width: "100%",
          maxWidth: 900,
          mx: "auto",
          flex: 1,
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <Stack spacing={2} alignItems="center" sx={{ mb: 4 }}>
          {!reviewLoaded && (
            <>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  bgcolor: "#eee",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FileSearch size={32} color="#053b8dff" />
              </Box>

              <Typography variant="h4">
                Enterprise Architecture Review
              </Typography>

              {!isViewOnly && (
                <Stack direction="row" spacing={1}>
                  <Upload size={20} />
                  <Typography color="text.secondary">
                    Upload your architecture files for review
                  </Typography>
                </Stack>
              )}
            </>
          )}

          {reviewLoaded && (
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ width: "100%" }}
            >
              <Box>
                <Typography variant="h5" fontWeight={600}>
                  Review Summary
                </Typography>
                {review?.review_id && (
                  <Typography variant="body2" color="text.secondary">
                    Review ID: {review.review_id}
                  </Typography>
                )}
              </Box>

              {similarityScore != null && (
                <Box sx={{ width: 180 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    gutterBottom
                  >
                    Similarity to Best-Practice
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={similarityScore}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {similarityScore}%
                  </Typography>
                </Box>
              )}
            </Stack>
          )}
        </Stack>

        {/* Loading indicator when switching sessions */}
        {loadingSession && (
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Loading session…
            </Typography>
            <Box sx={{ mt: 1 }}>
              <LinearProgress />
            </Box>
          </Paper>
        )}

        {/* Streaming Progress */}
        {streaming && (
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Live Review Progress
            </Typography>

            {activeEvent ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {camelToNormal(activeEvent.stage)}
                  <Box
                    component="span"
                    sx={{
                      ml: 1,
                      width: 20,
                      display: "inline-block",
                      textAlign: "left",
                    }}
                  >
                    {dots}
                  </Box>
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: getStatusColor(activeEvent.status),
                    fontWeight: 600,
                    ml: 2,
                    whiteSpace: "nowrap",
                  }}
                >
                  {camelToNormal(activeEvent.status)}
                </Typography>
              </Box>
            ) : (
              <Typography color="text.secondary">
                Waiting for updates…
              </Typography>
            )}
          </Paper>
        )}

        {/* Summary Cards */}
        {reviewLoaded &&
          sections.map((sec, i) => (
            <Paper
              key={i}
              variant="outlined"
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 3,
                border: "1px solid rgba(184, 185, 188, 0.4)", // soft border
              }}
            >
              {/* Title */}
              {sec.title && (
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  {sec.title}
                </Typography>
              )}

              {/* Bullets */}
              {sec.bullets.length > 0 ? (
                <ul style={{ marginTop: 4 }}>
                  {sec.bullets.map((b, j) => (
                    <li key={j}>
                      <Typography sx={{ fontSize: 14 }}>{b}</Typography>
                    </li>
                  ))}
                </ul>
              ) : (
                <Typography> No details provided. </Typography>
              )}
            </Paper>
          ))}

        {sessionId && !loadingSession && !reviewLoaded && (
          <Typography textAlign="center" color="text.secondary">
            Review for this session no longer exists.
          </Typography>
        )}
      </Box>

      {/* Input */}
      {!isViewOnly && inputVisible && (
        <Box sx={{ width: "70%", mx: "auto" }}>
          <ChatInputWithUploads onSend={handleSend} disabled={streaming} />
          <Typography
            variant="caption"
            color="text.secondary"
            textAlign="center"
            display="block"
            mt={1}
          >
            * Supports JSON, TXT, PDF, DOCX, ZIP, and images
          </Typography>
        </Box>
      )}

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((p) => ({ ...p, open: false }))}
      >
        <Alert severity={toast.severity}>{toast.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default MainContentArea;
