// import { useState } from "react";
// import Box from "@mui/material/Box";
// import Header from "@/components/Header";
// import Sidebar from "@/components/Sidebar";
// import MainContentArea from "@/components/MainContentArea";

// const EAReview = () => {
//   const [selectedSession, setSelectedSession] = useState(null);

//   // NEW: Triggers a refresh in Sidebar when changed
//   const [refreshTrigger, setRefreshTrigger] = useState(0);

//   const handleNewChat = () => {
//     setSelectedSession(null);
//   };

//   const handleSessionSelect = (session) => {
//     setSelectedSession(session);
//   };

//   const handleSessionCreated = (id) => {
//     // 1. Update the view to the new session
//     setSelectedSession({ session_id: id });
//     // 2. Increment trigger to force Sidebar to reload list
//     setRefreshTrigger((prev) => prev + 1);
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
//           refreshTrigger={refreshTrigger}
//         />

//         <Box sx={{ flex: 1, overflow: "hidden" }}>
//           <MainContentArea
//             sessionId={selectedSession?.session_id}
//             onSessionCreated={handleSessionCreated}
//           />
//         </Box>
//       </Box>
//     </Box>
//   );
// };

// export default EAReview;

// import React, { useState, useEffect, useRef } from "react";
// import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
// import {
//   Box, Container, Typography, LinearProgress, Paper, Divider, Chip, Fade, CircularProgress
// } from "@mui/material";
// import { BarChart } from "@mui/x-charts/BarChart";
// import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
// import { FolderSearch, Image as ImageIcon, Layers, FileText, BarChart2, Terminal, CheckCircle } from "lucide-react";
// import { getSession, startArchitectureReview } from "../services/AgenticService";
// import Header from "../components/Header";
// import MarkdownText from "../components/MarkdownText";

// const COLORS = { blue: "#002edc", red: "#D71920", black: "#000000", bg: "#F2F9FF", lightGray: "#f5f7fa", success: "#10b981" };

// // --- HELPER: Strip "Stage X:" from markdown ---
// const cleanMarkdownText = (text) => {
//   if (!text) return "";
//   // Removes "# Stage 1: ", "# Stage 2: ", etc., but keeps the "# " for the heading
//   return text.replace(/# Stage \d+:\s*/g, '# ');
// };

// // --- LIVE TERMINAL COMPONENT ---
// // Auto-scrolls internally as text arrives
// const LiveTerminalStream = ({ text }) => {
//   const termRef = useRef(null);
//   useEffect(() => {
//     if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
//   }, [text]);

//   return (
//     <Fade in={true}>
//       <Box ref={termRef} sx={{
//         bgcolor: "#1e1e1e", color: "#4ade80", p: 2, borderRadius: 2,
//         fontFamily: "monospace", fontSize: "0.85rem", height: "200px",
//         overflowY: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all",
//         boxShadow: "inset 0 0 10px rgba(0,0,0,0.5)"
//       }}>
//         <Box sx={{ display: "flex", alignItems: "center", mb: 1, color: "#888", gap: 1 }}>
//           <Terminal size={14} /> <Typography variant="caption">System Output Stream</Typography>
//         </Box>
//         <Divider sx={{ borderColor: "#333", mb: 1 }} />
//         {text}
//         <span style={{ animation: "blink 1s step-end infinite" }}>_</span>
//         <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
//       </Box>
//     </Fade>
//   );
// };

// const EAReview = () => {
//   const location = useLocation();
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();

//   // --- UI STATES ---
//   const [isFetching, setIsFetching] = useState(false);         // History load
//   const [isConnecting, setIsConnecting] = useState(false);     // Initial 2s buffer
//   const [isStreaming, setIsStreaming] = useState(false);       // Active streaming
//   const [isFinalizing, setIsFinalizing] = useState(false);     // Syncing the final UI transition
//   const [showPolished, setShowPolished] = useState(false);     // Toggles UI from Terminal -> Structured
//   const [apiError, setApiError] = useState(null);

//   // --- DATA STATES ---
//   const [liveText, setLiveText] = useState({ demographics_and_rag: "", image_analyzer_v4: "", remediation: "", formatter: "" });
//   const [finalPayload, setFinalPayload] = useState(null);

//   // --- REFS ---
//   const rawTextRefs = useRef({ demographics_and_rag: "", image_analyzer_v4: "", remediation: "", formatter: "" });
//   const lastProcessedRef = useRef(null); // Prevents React 18 Strict Mode double-calling
//   const endOfContentRef = useRef(null);

//   // --- SMOOTH TOKEN QUEUE (Typewriter Effect) ---
//   useEffect(() => {
//     if (!isStreaming || isConnecting) return;

//     const interval = setInterval(() => {
//       setLiveText(prev => {
//         let next = { ...prev };
//         let updated = false;
//         for (let key in rawTextRefs.current) {
//           const target = rawTextRefs.current[key];
//           const current = prev[key];
//           if (current.length < target.length) {
//             // Pull up to 5 characters every 15ms
//             const charsToAdd = target.slice(current.length, current.length + 5);
//             next[key] = current + charsToAdd;
//             updated = true;
//           }
//         }
//         return updated ? next : prev;
//       });
//     }, 15);
//     return () => clearInterval(interval);
//   }, [isStreaming, isConnecting]);

//   // --- AUTO-SCROLL GENTLY ---
//   useEffect(() => {
//     if (isStreaming || isFinalizing || showPolished) {
//       setTimeout(() => endOfContentRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 150);
//     }
//   }, [liveText.formatter, isFinalizing, showPolished]);

//   // --- INITIALIZATION & API INTEGRATION ---
//   useEffect(() => {
//     const initiateDataFetch = async () => {
//       const sessionId = searchParams.get("id");
//       const isNewReview = location.state?.triggerNewReview;

//       const currentAction = sessionId || (isNewReview ? "NEW_REVIEW_TRIGGERED" : null);

//       // GUARD: Prevent Double API Calls
//       if (!currentAction || lastProcessedRef.current === currentAction) return;
//       lastProcessedRef.current = currentAction;

//       // SCENARIO 1: View History
//       if (sessionId) {
//         setIsFetching(true);
//         try {
//           const data = await getSession(sessionId);
//           setFinalPayload(data?.details || data);
//           setShowPolished(true); // Jump straight to polished UI
//         } catch (error) { setApiError(error.message); }
//         finally { setIsFetching(false); }
//         return;
//       }

//       // SCENARIO 2: Live Stream
//       if (isNewReview && location.state?.payload) {
//         setIsConnecting(true); // Start 2s buffer
//         setIsStreaming(true);
//         setTimeout(() => setIsConnecting(false), 2000); // End 2s buffer

//         const { title, description, file } = location.state.payload;
//         try {
//           await startArchitectureReview(title, description, file, {
//             onToken: (data) => {
//               const id = data.executor_id;
//               const text = data.text || "";
//               if (rawTextRefs.current[id] !== undefined) {
//                 rawTextRefs.current[id] += text;
//               }
//             },
//             onFinal: (data) => {
//               // 1. Save the pristine master payload
//               setFinalPayload(data?.details || data);
//               setIsStreaming(false);

//               // 2. Trigger the "Finalizing" loading screen for a smooth transition
//               setIsFinalizing(true);

//               setTimeout(() => {
//                 setIsFinalizing(false);
//                 setShowPolished(true); // The Big Reveal
//                 window.history.replaceState({}, document.title); // Clean URL
//               }, 1500); // 1.5 second UI transition buffer
//             },
//             onError: (err) => { setApiError(err?.message); setIsStreaming(false); setIsConnecting(false); }
//           });
//         } catch (error) { setApiError(error.message); setIsStreaming(false); setIsConnecting(false); }
//       }
//     };
//     initiateDataFetch();
//   }, [location.state, searchParams]);

//   // --- ERROR STATE ---
//   if (apiError) return (
//     <Box sx={{ p: 4, textAlign: "center", mt: 10 }}>
//       <Typography variant="h5" color="error" gutterBottom>Analysis Failed</Typography>
//       <Typography mb={3}>{apiError}</Typography>
//       <Chip label="Go Back to Home" onClick={() => navigate("/home")} clickable color="primary" />
//     </Box>
//   );

//   // --- DATA EXTRACTION (For Polished UI) ---
//   // Safely extract from final payload based on BE logs structure
//   const pDemographics = finalPayload?.raw_data?.demographics || finalPayload?.demographics;
//   const pImageAnalysis = finalPayload?.raw_data?.image_analysis || finalPayload?.image_analysis_full_report;
//   const pRemediation = finalPayload?.raw_data?.remediation || finalPayload?.remediation;
//   const pMarkdown = finalPayload?.final_report_markdown || finalPayload?.final_markdown;

//   return (
//     <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", bgcolor: COLORS.bg }}>
//       <Header />

//       {/* Sticky Progress & Status Header - Cleaned up to remove redundant heading/back button */}
//       <Box sx={{ position: "sticky", top: 0, zIndex: 10, bgcolor: "white", borderBottom: `1px solid ${COLORS.lightGray}` }}>
//         {(isFetching || isStreaming || isFinalizing) && <LinearProgress color="primary" sx={{ height: 4 }} />}

//         <Box sx={{ py: 1, px: 4, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
//           {isStreaming && !isConnecting && <Chip label="Agent is actively analyzing..." size="small" sx={{ bgcolor: COLORS.red, color: 'white', fontWeight: 'bold', animation: "pulse 1.5s infinite" }} />}
//           {isFinalizing && <Chip label="Finalizing Report..." size="small" sx={{ bgcolor: COLORS.blue, color: 'white', fontWeight: 'bold' }} />}
//           {showPolished && <Chip label="Review Complete" size="small" sx={{ bgcolor: COLORS.success, color: 'white', fontWeight: 'bold' }} />}
//         </Box>
//       </Box>

//       <Container maxWidth="xl" sx={{ flex: 1, overflowY: "auto", py: 4, pb: 10 }}>

//         {/* --- 1. INITIAL LOADING (2s Buffer) --- */}
//         {isConnecting && (
//           <Box sx={{ height: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
//             <CircularProgress size={60} thickness={4} sx={{ color: COLORS.blue, mb: 3 }} />
//             <Typography variant="h5" fontWeight={700} color={COLORS.black}>Establishing connection to Agentic Backend...</Typography>
//             <Typography variant="body1" color="text.secondary">Initializing components and preparing architecture stream.</Typography>
//           </Box>
//         )}

//         {isFetching && <Box sx={{ textAlign: 'center', mt: 10 }}><Typography variant="h6" color="text.secondary">Fetching historical logs...</Typography></Box>}

//         {/* --- 2. THE BIG TRANSITION SPINNER --- */}
//         {isFinalizing && (
//            <Box sx={{ height: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
//              <CircularProgress size={60} thickness={4} sx={{ color: COLORS.success, mb: 3 }} />
//              <Typography variant="h5" fontWeight={700} color={COLORS.black}>Consolidating Final Architecture Report...</Typography>
//              <Typography variant="body1" color="text.secondary">Applying security and compliance frameworks.</Typography>
//            </Box>
//         )}

//         {/* --- MAIN CONTENT BLOCKS --- */}
//         {!isConnecting && !isFinalizing && !isFetching && (
//           <>
//             {/* --- SECTION 1: Project Specifics --- */}
//             {(showPolished || liveText.demographics_and_rag) && (
//               <Fade in={true} timeout={600}>
//                 <Paper elevation={0} sx={{ p: 4, mb: 4, minHeight: 250, border: `1px solid ${!showPolished ? COLORS.blue : '#e0e0e0'}`, borderRadius: 2 }}>
//                   <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1.5 }}>
//                     <FolderSearch color={COLORS.red} size={28} />
//                     <Typography variant="h5" sx={{ color: COLORS.blue, fontWeight: 700 }}>Project Specifics</Typography>
//                     {showPolished && <CheckCircle color={COLORS.success} size={22} style={{ marginLeft: 'auto' }} />}
//                   </Box>
//                   <Divider sx={{ mb: 2 }} />

//                   {showPolished && pDemographics ? (
//                     <Fade in={true} timeout={800}>
//                       <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
//                         {Object.entries(pDemographics).map(([key, val]) => (
//                           <Box key={key} sx={{ bgcolor: COLORS.lightGray, p: 2, borderRadius: 2, minWidth: 200 }}>
//                             <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>{key.replace(/_/g, ' ')}</Typography>
//                             <Typography variant="body1" color={COLORS.black} fontWeight={600}>{String(val)}</Typography>
//                           </Box>
//                         ))}
//                       </Box>
//                     </Fade>
//                   ) : (
//                     <LiveTerminalStream text={liveText.demographics_and_rag} />
//                   )}
//                 </Paper>
//               </Fade>
//             )}

//             {/* --- SECTION 2: Image Analysis --- */}
//             {(showPolished || liveText.image_analyzer_v4) && (
//               <Fade in={true} timeout={600}>
//                 <Paper elevation={0} sx={{ p: 4, mb: 4, minHeight: 250, border: `1px solid ${!showPolished ? COLORS.blue : '#e0e0e0'}`, borderRadius: 2 }}>
//                   <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1.5 }}>
//                     <ImageIcon color={COLORS.red} size={28} />
//                     <Typography variant="h5" sx={{ color: COLORS.blue, fontWeight: 700 }}>Image Analysis</Typography>
//                     {showPolished && <CheckCircle color={COLORS.success} size={22} style={{ marginLeft: 'auto' }} />}
//                   </Box>
//                   <Divider sx={{ mb: 2 }} />

//                   {showPolished && pImageAnalysis ? (
//                     <Fade in={true} timeout={800}>
//                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

//                         {/* Dynamic Render for all cxo_summary keys */}
//                         {pImageAnalysis.cxo_summary && (
//                           <>
//                             {Object.entries(pImageAnalysis.cxo_summary).map(([key, value]) => {
//                               if (!value || (Array.isArray(value) && value.length === 0)) return null;

//                               // Format snake_case to Title Case (e.g., "single_points_of_failure" -> "Single Points Of Failure")
//                               const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

//                               return (
//                                 <Box key={key}>
//                                   <Typography variant="subtitle1" fontWeight={700} color={COLORS.black} mb={1}>
//                                     {formattedKey}
//                                   </Typography>
//                                   {Array.isArray(value) ? (
//                                     <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
//                                       {value.map((item, i) => (
//                                         <Chip key={i} label={item} variant="outlined" sx={{ color: COLORS.blue, borderColor: COLORS.blue }} />
//                                       ))}
//                                     </Box>
//                                   ) : (
//                                     <Typography variant="body2" sx={{ bgcolor: COLORS.lightGray, p: 2, borderRadius: 1 }}>
//                                       {value}
//                                     </Typography>
//                                   )}
//                                 </Box>
//                               );
//                             })}
//                           </>
//                         )}

//                         {/* QA Audit Block */}
//                         {pImageAnalysis.qa_audit && (
//                           <Box>
//                             <Typography variant="subtitle1" fontWeight={700} color={COLORS.black} mb={1}>QA Audit</Typography>
//                             <Typography variant="body2" sx={{ bgcolor: '#fff3e0', p: 2, borderRadius: 1, border: '1px solid #ffe0b2' }}>
//                               Detected {pImageAnalysis.qa_audit.deterministic_metrics?.total_components_detected} components. Graph Coverage: {pImageAnalysis.qa_audit.deterministic_metrics?.graph_coverage_percentage}%.
//                             </Typography>
//                           </Box>
//                         )}
//                       </Box>
//                     </Fade>
//                   ) : (
//                     <LiveTerminalStream text={liveText.image_analyzer_v4} />
//                   )}
//                 </Paper>
//               </Fade>
//             )}

//             {/* --- SECTION 3: Semantic Consolidation --- */}
//             {(showPolished || liveText.remediation) && (
//               <Fade in={true} timeout={600}>
//                 <Paper elevation={0} sx={{ p: 4, mb: 4, minHeight: 250, border: `1px solid ${!showPolished ? COLORS.blue : '#e0e0e0'}`, borderRadius: 2 }}>
//                   <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1.5 }}>
//                     <Layers color={COLORS.red} size={28} />
//                     <Typography variant="h5" sx={{ color: COLORS.blue, fontWeight: 700 }}>Semantic Consolidation</Typography>
//                     {showPolished && <CheckCircle color={COLORS.success} size={22} style={{ marginLeft: 'auto' }} />}
//                   </Box>
//                   <Divider sx={{ mb: 2 }} />

//                   {showPolished && pRemediation ? (
//                     <Fade in={true} timeout={800}>
//                       <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
//                         <Box>
//                           <Typography variant="subtitle1" fontWeight={700} color={COLORS.black} mb={2}>Available Components in Triage</Typography>
//                           <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
//                             {pRemediation.available_components_in_triage?.map((c, i) => <Chip key={i} label={c} size="small" sx={{ bgcolor: COLORS.lightGray, color: COLORS.black }} />)}
//                           </Box>
//                         </Box>
//                         <Box>
//                           <Typography variant="subtitle1" fontWeight={700} color={COLORS.red} mb={2}>Missing Components in Triage</Typography>
//                           <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
//                             {pRemediation.missing_components_in_triage?.map((c, i) => <Chip key={i} label={c} size="small" sx={{ bgcolor: '#ffebee', color: COLORS.red, fontWeight: 600 }} />)}
//                           </Box>
//                         </Box>
//                       </Box>
//                     </Fade>
//                   ) : (
//                     <LiveTerminalStream text={liveText.remediation} />
//                   )}
//                 </Paper>
//               </Fade>
//             )}

//             {/* --- SECTION 4: Review Summary --- */}
//             {(showPolished || liveText.formatter) && (
//               <Fade in={true} timeout={600}>
//                 <Paper elevation={0} sx={{ p: 4, mb: 4, minHeight: 150, borderRadius: 2, border: `1px solid ${!showPolished ? COLORS.blue : '#e0e0e0'}` }}>
//                   <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1.5 }}>
//                     <FileText color={COLORS.red} size={28} />
//                     <Typography variant="h5" sx={{ color: COLORS.blue, fontWeight: 700 }}>Review Summary</Typography>
//                     {showPolished && <CheckCircle color={COLORS.success} size={22} style={{ marginLeft: 'auto' }} />}
//                   </Box>
//                   <Divider sx={{ mb: 3 }} />
//                   <MarkdownText text={cleanMarkdownText(showPolished ? pMarkdown : liveText.formatter)} />
//                 </Paper>
//               </Fade>
//             )}

//             {/* --- SECTION 5: Metrics & Graphs (Only visible when fully finished) --- */}
//             {showPolished && finalPayload?.metrics && finalPayload?.ui_graphs && (
//               <Fade in={true} timeout={1200}>
//                 <Box>
//                   <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 1.5, mt: 6 }}>
//                     <BarChart2 color={COLORS.red} size={32} />
//                     <Typography variant="h4" sx={{ color: COLORS.blue, fontWeight: 700 }}>Agent Telemetry Metrics</Typography>
//                   </Box>
//                   <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 4 }}>
//                     <Paper elevation={0} sx={{ p: 3, border: `1px solid #e0e0e0`, borderRadius: 2 }}>
//                       <Typography variant="h6" sx={{ color: COLORS.black, fontWeight: 600, mb: 3, textAlign: "center" }}>Token Distribution</Typography>
//                       <BarChart
//                         dataset={[
//                           { agent: "Demographics", input: finalPayload.metrics.demographics_and_rag?.input_tokens || 0, output: finalPayload.metrics.demographics_and_rag?.output_tokens || 0 },
//                           { agent: "Image Analyzer", input: finalPayload.metrics.image_analyzer_v4?.input_tokens || 0, output: finalPayload.metrics.image_analyzer_v4?.output_tokens || 0 },
//                           { agent: "Remediation", input: finalPayload.metrics.remediation?.input_tokens || 0, output: finalPayload.metrics.remediation?.output_tokens || 0 },
//                           { agent: "Formatter", input: finalPayload.metrics.formatter?.input_tokens || 0, output: finalPayload.metrics.formatter?.output_tokens || 0 }
//                         ]} xAxis={[{ scaleType: 'band', dataKey: 'agent' }]} series={[{ dataKey: 'input', label: 'Input', color: '#8884d8', stack: 'total' }, { dataKey: 'output', label: 'Output', color: '#82ca9d', stack: 'total' }]} height={350} />
//                     </Paper>
//                     <Paper elevation={0} sx={{ p: 3, border: `1px solid #e0e0e0`, borderRadius: 2 }}>
//                       <Typography variant="h6" sx={{ color: COLORS.black, fontWeight: 600, mb: 1, textAlign: "center" }}>Quality Matrix (Max: 10)</Typography>
//                       <ResponsiveContainer width="100%" height={350}>
//                         <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
//                           { subject: "Accuracy", Demographics: finalPayload.ui_graphs.agent_metrics?.demographics?.scores?.accuracy || 0, Image: finalPayload.ui_graphs.agent_metrics?.image_analyzer?.scores?.accuracy || 0, Remediation: finalPayload.ui_graphs.agent_metrics?.remediation?.scores?.accuracy || 0, Formatter: finalPayload.ui_graphs.agent_metrics?.formatting?.scores?.accuracy || 0, fullMark: 10 },
//                           { subject: "Bias", Demographics: finalPayload.ui_graphs.agent_metrics?.demographics?.scores?.bias || 0, Image: finalPayload.ui_graphs.agent_metrics?.image_analyzer?.scores?.bias || 0, Remediation: finalPayload.ui_graphs.agent_metrics?.remediation?.scores?.bias || 0, Formatter: finalPayload.ui_graphs.agent_metrics?.formatting?.scores?.bias || 0, fullMark: 10 },
//                           { subject: "Hallucination", Demographics: finalPayload.ui_graphs.agent_metrics?.demographics?.scores?.hallucination || 0, Image: finalPayload.ui_graphs.agent_metrics?.image_analyzer?.scores?.hallucination || 0, Remediation: finalPayload.ui_graphs.agent_metrics?.remediation?.scores?.hallucination || 0, Formatter: finalPayload.ui_graphs.agent_metrics?.formatting?.scores?.hallucination || 0, fullMark: 10 },
//                           { subject: "Confidence", Demographics: finalPayload.ui_graphs.agent_metrics?.demographics?.scores?.confidence || 0, Image: finalPayload.ui_graphs.agent_metrics?.image_analyzer?.scores?.confidence || 0, Remediation: finalPayload.ui_graphs.agent_metrics?.remediation?.scores?.confidence || 0, Formatter: finalPayload.ui_graphs.agent_metrics?.formatting?.scores?.confidence || 0, fullMark: 10 }
//                         ]}>
//                           <PolarGrid stroke="#e0e0e0" /><PolarAngleAxis dataKey="subject" tick={{ fill: COLORS.blue, fontWeight: 600 }} /><PolarRadiusAxis angle={30} domain={[0, 10]} />
//                           <Radar name="Demographics" dataKey="Demographics" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
//                           <Radar name="Image Analyzer" dataKey="Image" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
//                           <Radar name="Remediation" dataKey="Remediation" stroke="#ffc658" fill="#ffc658" fillOpacity={0.3} />
//                           <Radar name="Formatter" dataKey="Formatter" stroke={COLORS.red} fill={COLORS.red} fillOpacity={0.3} />
//                           <RechartsTooltip /><Legend />
//                         </RadarChart>
//                       </ResponsiveContainer>
//                     </Paper>
//                   </Box>
//                 </Box>
//               </Fade>
//             )}

//             {/* Invisible anchor for scrolling */}
//             <div ref={endOfContentRef} style={{ height: 1 }} />
//           </>
//         )}
//       </Container>
//     </Box>
//   );
// };

// export default EAReview;

// import React, { useState, useEffect, useRef } from "react";
// import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
// import {
//   Box,
//   Container,
//   Typography,
//   LinearProgress,
//   Paper,
//   Divider,
//   Chip,
//   Fade,
//   CircularProgress,
// } from "@mui/material";
// import { BarChart } from "@mui/x-charts/BarChart";
// import {
//   Radar,
//   RadarChart,
//   PolarGrid,
//   PolarAngleAxis,
//   PolarRadiusAxis,
//   ResponsiveContainer,
//   Tooltip as RechartsTooltip,
//   Legend,
// } from "recharts";
// import {
//   FolderSearch,
//   Image as ImageIcon,
//   Layers,
//   FileText,
//   BarChart2,
//   CheckCircle,
// } from "lucide-react";
// import {
//   getSession,
//   startArchitectureReview,
// } from "../services/AgenticService";
// import Header from "../components/Header";
// import MarkdownText from "../components/MarkdownText";
// import AnimatedArchitectureFlow from "../components/Review/AnimatedArchitectureFlow";

// const COLORS = {
//   blue: "#002edc",
//   red: "#D71920",
//   black: "#000000",
//   bg: "#F2F9FF",
//   lightGray: "#f5f7fa",
//   success: "#10b981",
// };

// // --- HELPER: Strip "Stage X:" from markdown ---
// const cleanMarkdownText = (text) => {
//   if (!text) return "";
//   return text.replace(/# Stage \d+:\s*/g, "# ");
// };

// // --- HELPER: Safely parse JSON mid-stream ---
// const parseBuffer = (buffer) => {
//   try {
//     const cleaned = buffer
//       .replace(/```json/gi, "")
//       .replace(/```/g, "")
//       .trim();
//     return JSON.parse(cleaned);
//   } catch (e) {
//     return null; // Will fallback to final payload if mid-stream parsing fails
//   }
// };

// const EAReview = () => {
//   const location = useLocation();
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();

//   // --- STREAM TIMELINE PHASES ---
//   // 'idle' -> 'fetching' -> 'connecting' -> 'animating' -> 'live_cards' -> 'finalizing' -> 'polished'
//   const [streamPhase, setStreamPhase] = useState("idle");
//   const [apiError, setApiError] = useState(null);

//   // --- DATA STATES ---
//   const [activeStage, setActiveStage] = useState(null);
//   const [streamedData, setStreamedData] = useState({
//     demographics: null,
//     image_analysis: null,
//     remediation: null,
//   });
//   const [liveFormatterText, setLiveFormatterText] = useState("");
//   const [finalPayload, setFinalPayload] = useState(null);

//   // --- REFS ---
//   const formatterTextRef = useRef("");
//   const jsonBuffers = useRef({
//     demographics_and_rag: "",
//     image_analyzer_v4: "",
//     remediation: "",
//   });
//   const formatterTimeoutRef = useRef(null);
//   const lastProcessedRef = useRef(null);
//   const endOfContentRef = useRef(null);

//   // --- DYNAMIC ANIMATION TEXT ---
//   const getStageText = (stage) => {
//     switch (stage) {
//       case "demographics_and_rag":
//         return "Project Specifics Contextualization in progress...";
//       case "image_analyzer_v4":
//         return "Visual Architecture Intelligence in progress...";
//       case "remediation":
//         return "Semantic Consolidation & Gap Analysis in progress...";
//       case "formatter":
//         return "Drafting Executive Summary...";
//       case "scorer":
//         return "Running Quality Metrics...";
//       default:
//         return "Analyzing Architecture...";
//     }
//   };

//   // --- SMOOTH TYPEWRITER QUEUE (For Formatter Only) ---
//   useEffect(() => {
//     if (streamPhase !== "live_cards") return;

//     const interval = setInterval(() => {
//       setLiveFormatterText((prev) => {
//         const target = formatterTextRef.current;
//         if (prev.length < target.length) {
//           const charsToAdd = target.slice(prev.length, prev.length + 5);
//           return prev + charsToAdd;
//         }
//         return prev;
//       });
//     }, 15);
//     return () => clearInterval(interval);
//   }, [streamPhase]);

//   // --- AUTO-SCROLL ---
//   useEffect(() => {
//     if (["live_cards", "finalizing", "polished"].includes(streamPhase)) {
//       setTimeout(
//         () =>
//           endOfContentRef.current?.scrollIntoView({
//             behavior: "smooth",
//             block: "end",
//           }),
//         150,
//       );
//     }
//   }, [liveFormatterText, streamPhase]);

//   // --- INITIALIZATION & API INTEGRATION ---
//   useEffect(() => {
//     const initiateDataFetch = async () => {
//       const sessionId = searchParams.get("id");
//       const isNewReview = location.state?.triggerNewReview;

//       const currentAction =
//         sessionId || (isNewReview ? "NEW_REVIEW_TRIGGERED" : null);
//       if (!currentAction || lastProcessedRef.current === currentAction) return;
//       lastProcessedRef.current = currentAction;

//       // SCENARIO 1: View History
//       if (sessionId) {
//         setStreamPhase("fetching");
//         try {
//           const data = await getSession(sessionId);
//           setFinalPayload(data?.details || data);
//           setStreamPhase("polished");
//         } catch (error) {
//           setApiError(error.message);
//         }
//         return;
//       }

//       // SCENARIO 2: Live Stream
//       if (isNewReview && location.state?.payload) {
//         setStreamPhase("connecting");
//         setTimeout(() => setStreamPhase("animating"), 2000); // 2s connection buffer

//         const { title, description, file } = location.state.payload;
//         try {
//           await startArchitectureReview(title, description, file, {
//             onStage: (data) => {
//               if (data.type === "stage_start") {
//                 setActiveStage(data.executor);

//                 // Formatter 2-Second Delay Logic
//                 if (data.executor === "formatter") {
//                   formatterTimeoutRef.current = setTimeout(() => {
//                     setStreamedData({
//                       demographics: parseBuffer(
//                         jsonBuffers.current.demographics_and_rag,
//                       ),
//                       image_analysis: parseBuffer(
//                         jsonBuffers.current.image_analyzer_v4,
//                       ),
//                       remediation: parseBuffer(jsonBuffers.current.remediation),
//                     });
//                     setStreamPhase("live_cards"); // Swap Animation for Live Cards
//                   }, 2000);
//                 }
//               }
//             },
//             onToken: (data) => {
//               const id = data.executor_id;
//               const text = data.text || "";
//               if (
//                 [
//                   "demographics_and_rag",
//                   "image_analyzer_v4",
//                   "remediation",
//                 ].includes(id)
//               ) {
//                 jsonBuffers.current[id] += text;
//               } else if (id === "formatter") {
//                 formatterTextRef.current += text;
//               }
//             },
//             onFinal: (data) => {
//               clearTimeout(formatterTimeoutRef.current);
//               setFinalPayload(data?.details || data);
//               setStreamPhase("finalizing");

//               setTimeout(() => {
//                 setStreamPhase("polished"); // The Big Reveal
//                 window.history.replaceState({}, document.title); // Clean URL
//               }, 1500); // 1.5s Transition Spinner
//             },
//             onError: (err) => {
//               setApiError(err?.message);
//               setStreamPhase("error");
//             },
//           });
//         } catch (error) {
//           setApiError(error.message);
//           setStreamPhase("error");
//         }
//       }
//     };
//     initiateDataFetch();
//   }, [location.state, searchParams]);

//   // --- ERROR STATE ---
//   if (apiError)
//     return (
//       <Box sx={{ p: 4, textAlign: "center", mt: 10 }}>
//         <Typography variant="h5" color="error" gutterBottom>
//           Analysis Failed
//         </Typography>
//         <Typography mb={3}>{apiError}</Typography>
//         <Chip
//           label="Go Back to Home"
//           onClick={() => navigate("/home")}
//           clickable
//           color="primary"
//         />
//       </Box>
//     );

//   // --- DATA EXTRACTION ---
//   const isPolished = streamPhase === "polished";
//   const pDemographics = isPolished
//     ? finalPayload?.raw_data?.demographics || finalPayload?.demographics
//     : streamedData.demographics;
//   const pImageAnalysis = isPolished
//     ? finalPayload?.raw_data?.image_analysis ||
//       finalPayload?.image_analysis_full_report
//     : streamedData.image_analysis;
//   const pRemediation = isPolished
//     ? finalPayload?.raw_data?.remediation || finalPayload?.remediation
//     : streamedData.remediation;
//   const pMarkdown = isPolished
//     ? finalPayload?.final_report_markdown || finalPayload?.final_markdown
//     : liveFormatterText;

//   // Render logic flags
//   const showCards = ["live_cards", "polished"].includes(streamPhase);

//   return (
//     <Box
//       sx={{
//         display: "flex",
//         flexDirection: "column",
//         height: "100vh",
//         bgcolor: COLORS.bg,
//       }}
//     >
//       <Header />

//       {/* Sticky Status Bar (Redundant title & back button removed) */}
//       <Box
//         sx={{
//           position: "sticky",
//           top: 0,
//           zIndex: 10,
//           bgcolor: "white",
//           borderBottom: `1px solid ${COLORS.lightGray}`,
//         }}
//       >
//         {[
//           "fetching",
//           "connecting",
//           "animating",
//           "live_cards",
//           "finalizing",
//         ].includes(streamPhase) && (
//           <LinearProgress color="primary" sx={{ height: 4 }} />
//         )}

//         <Box
//           sx={{
//             py: 1,
//             px: 4,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "flex-end",
//           }}
//         >
//           {["animating", "live_cards"].includes(streamPhase) && (
//             <Chip
//               label="Agent is actively analyzing..."
//               size="small"
//               sx={{
//                 bgcolor: COLORS.red,
//                 color: "white",
//                 fontWeight: "bold",
//                 animation: "pulse 1.5s infinite",
//               }}
//             />
//           )}
//           {streamPhase === "finalizing" && (
//             <Chip
//               label="Finalizing Report..."
//               size="small"
//               sx={{ bgcolor: COLORS.blue, color: "white", fontWeight: "bold" }}
//             />
//           )}
//           {streamPhase === "polished" && (
//             <Chip
//               label="Review Complete"
//               size="small"
//               sx={{
//                 bgcolor: COLORS.success,
//                 color: "white",
//                 fontWeight: "bold",
//               }}
//             />
//           )}
//         </Box>
//       </Box>

//       <Container
//         maxWidth="xl"
//         sx={{ flex: 1, overflowY: "auto", py: 4, pb: 10 }}
//       >
//         {/* --- INITIAL LOADING (2s Buffer) --- */}
//         {streamPhase === "connecting" && (
//           <Box
//             sx={{
//               height: "60vh",
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               justifyContent: "center",
//             }}
//           >
//             <CircularProgress
//               size={60}
//               thickness={4}
//               sx={{ color: COLORS.blue, mb: 3 }}
//             />
//             <Typography variant="h5" fontWeight={700} color={COLORS.black}>
//               Establishing connection to Agentic Backend...
//             </Typography>
//             <Typography variant="body1" color="text.secondary">
//               Initializing components and preparing architecture stream.
//             </Typography>
//           </Box>
//         )}

//         {streamPhase === "fetching" && (
//           <Box sx={{ textAlign: "center", mt: 10 }}>
//             <Typography variant="h6" color="text.secondary">
//               Fetching historical logs...
//             </Typography>
//           </Box>
//         )}

//         {/* --- ANIMATION PHASE --- */}
//         {streamPhase === "animating" && (
//           <Box
//             sx={{
//               height: "60vh",
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               justifyContent: "center",
//             }}
//           >
//             <AnimatedArchitectureFlow />
//             <Typography
//               variant="h5"
//               fontWeight={700}
//               color={COLORS.blue}
//               sx={{ mt: 4, animation: "pulse 1.5s infinite" }}
//             >
//               {getStageText(activeStage)}
//             </Typography>
//           </Box>
//         )}

//         {/* --- THE BIG TRANSITION SPINNER --- */}
//         {streamPhase === "finalizing" && (
//           <Box
//             sx={{
//               height: "60vh",
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               justifyContent: "center",
//             }}
//           >
//             <CircularProgress
//               size={60}
//               thickness={4}
//               sx={{ color: COLORS.success, mb: 3 }}
//             />
//             <Typography variant="h5" fontWeight={700} color={COLORS.black}>
//               Consolidating Final Architecture Report...
//             </Typography>
//             <Typography variant="body1" color="text.secondary">
//               Applying security and compliance frameworks.
//             </Typography>
//           </Box>
//         )}

//         {/* --- MAIN STRUCTURED CONTENT BLOCKS --- */}
//         {showCards && (
//           <Fade in={true} timeout={600}>
//             <Box>
//               {/* SECTION 1: Project Specifics */}
//               {pDemographics && (
//                 <Paper
//                   elevation={0}
//                   sx={{
//                     p: 4,
//                     mb: 4,
//                     border: `1px solid ${COLORS.lightGray}`,
//                     borderRadius: 2,
//                   }}
//                 >
//                   <Box
//                     sx={{
//                       display: "flex",
//                       alignItems: "center",
//                       mb: 2,
//                       gap: 1.5,
//                     }}
//                   >
//                     <FolderSearch color={COLORS.red} size={28} />
//                     <Typography
//                       variant="h5"
//                       sx={{ color: COLORS.blue, fontWeight: 700 }}
//                     >
//                       Project Specifics
//                     </Typography>
//                     {isPolished && (
//                       <CheckCircle
//                         color={COLORS.success}
//                         size={22}
//                         style={{ marginLeft: "auto" }}
//                       />
//                     )}
//                   </Box>
//                   <Divider sx={{ mb: 3 }} />

//                   <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
//                     {Object.entries(pDemographics).map(([key, val]) => (
//                       <Box
//                         key={key}
//                         sx={{
//                           display: "flex",
//                           flexDirection: "column",
//                           alignItems: "flex-start",
//                           minWidth: 150,
//                         }}
//                       >
//                         <Typography
//                           variant="caption"
//                           color="text.secondary"
//                           sx={{
//                             textTransform: "uppercase",
//                             fontWeight: 700,
//                             mb: 0.5,
//                           }}
//                         >
//                           {key.replace(/_/g, " ")}
//                         </Typography>
//                         <Chip
//                           label={String(val)}
//                           sx={{
//                             bgcolor: COLORS.lightGray,
//                             color: COLORS.black,
//                             fontWeight: 600,
//                             borderRadius: 1,
//                           }}
//                         />
//                       </Box>
//                     ))}
//                   </Box>
//                 </Paper>
//               )}

//               {/* SECTION 2: Image Analysis */}
//               {pImageAnalysis && (
//                 <Paper
//                   elevation={0}
//                   sx={{
//                     p: 4,
//                     mb: 4,
//                     border: `1px solid ${COLORS.lightGray}`,
//                     borderRadius: 2,
//                   }}
//                 >
//                   <Box
//                     sx={{
//                       display: "flex",
//                       alignItems: "center",
//                       mb: 2,
//                       gap: 1.5,
//                     }}
//                   >
//                     <ImageIcon color={COLORS.red} size={28} />
//                     <Typography
//                       variant="h5"
//                       sx={{ color: COLORS.blue, fontWeight: 700 }}
//                     >
//                       Image Analysis
//                     </Typography>
//                     {isPolished && (
//                       <CheckCircle
//                         color={COLORS.success}
//                         size={22}
//                         style={{ marginLeft: "auto" }}
//                       />
//                     )}
//                   </Box>
//                   <Divider sx={{ mb: 3 }} />

//                   <Box
//                     sx={{ display: "flex", flexDirection: "column", gap: 3 }}
//                   >
//                     {pImageAnalysis.cxo_summary && (
//                       <>
//                         {Object.entries(pImageAnalysis.cxo_summary).map(
//                           ([key, value]) => {
//                             if (
//                               !value ||
//                               (Array.isArray(value) && value.length === 0)
//                             )
//                               return null;
//                             const formattedKey = key
//                               .replace(/_/g, " ")
//                               .replace(/\b\w/g, (l) => l.toUpperCase());

//                             return (
//                               <Box key={key}>
//                                 <Typography
//                                   variant="subtitle1"
//                                   fontWeight={700}
//                                   color={COLORS.black}
//                                   mb={0.5}
//                                 >
//                                   {formattedKey}
//                                 </Typography>
//                                 {Array.isArray(value) ? (
//                                   <Box
//                                     component="ul"
//                                     sx={{ mt: 0, mb: 0, pl: 3 }}
//                                   >
//                                     {value.map((item, i) => (
//                                       <Typography
//                                         component="li"
//                                         variant="body2"
//                                         key={i}
//                                         sx={{ mb: 0.5, color: COLORS.black }}
//                                       >
//                                         {item}
//                                       </Typography>
//                                     ))}
//                                   </Box>
//                                 ) : (
//                                   <Typography
//                                     variant="body2"
//                                     sx={{
//                                       bgcolor: COLORS.lightGray,
//                                       p: 2,
//                                       borderRadius: 1,
//                                     }}
//                                   >
//                                     {value}
//                                   </Typography>
//                                 )}
//                               </Box>
//                             );
//                           },
//                         )}
//                       </>
//                     )}
//                     {pImageAnalysis.qa_audit && (
//                       <Box>
//                         <Typography
//                           variant="subtitle1"
//                           fontWeight={700}
//                           color={COLORS.black}
//                           mb={0.5}
//                         >
//                           QA Audit
//                         </Typography>
//                         <Typography
//                           variant="body2"
//                           sx={{
//                             bgcolor: "#fff3e0",
//                             p: 2,
//                             borderRadius: 1,
//                             border: "1px solid #ffe0b2",
//                           }}
//                         >
//                           Detected{" "}
//                           {
//                             pImageAnalysis.qa_audit.deterministic_metrics
//                               ?.total_components_detected
//                           }{" "}
//                           components. Graph Coverage:{" "}
//                           {
//                             pImageAnalysis.qa_audit.deterministic_metrics
//                               ?.graph_coverage_percentage
//                           }
//                           %.
//                         </Typography>
//                       </Box>
//                     )}
//                   </Box>
//                 </Paper>
//               )}

//               {/* SECTION 3: Semantic Consolidation */}
//               {pRemediation && (
//                 <Paper
//                   elevation={0}
//                   sx={{
//                     p: 4,
//                     mb: 4,
//                     border: `1px solid ${COLORS.lightGray}`,
//                     borderRadius: 2,
//                   }}
//                 >
//                   <Box
//                     sx={{
//                       display: "flex",
//                       alignItems: "center",
//                       mb: 2,
//                       gap: 1.5,
//                     }}
//                   >
//                     <Layers color={COLORS.red} size={28} />
//                     <Typography
//                       variant="h5"
//                       sx={{ color: COLORS.blue, fontWeight: 700 }}
//                     >
//                       Semantic Consolidation
//                     </Typography>
//                     {isPolished && (
//                       <CheckCircle
//                         color={COLORS.success}
//                         size={22}
//                         style={{ marginLeft: "auto" }}
//                       />
//                     )}
//                   </Box>
//                   <Divider sx={{ mb: 3 }} />

//                   <Box
//                     sx={{
//                       display: "grid",
//                       gridTemplateColumns: "1fr 1fr",
//                       gap: 4,
//                     }}
//                   >
//                     <Box>
//                       <Typography
//                         variant="subtitle1"
//                         fontWeight={700}
//                         color={COLORS.black}
//                         mb={1}
//                       >
//                         Available Components in Triage
//                       </Typography>
//                       <Box component="ul" sx={{ mt: 0, mb: 0, pl: 3 }}>
//                         {pRemediation.available_components_in_triage?.map(
//                           (c, i) => (
//                             <Typography
//                               component="li"
//                               variant="body2"
//                               key={i}
//                               sx={{ mb: 0.5, color: COLORS.black }}
//                             >
//                               {c}
//                             </Typography>
//                           ),
//                         )}
//                       </Box>
//                     </Box>
//                     <Box>
//                       <Typography
//                         variant="subtitle1"
//                         fontWeight={700}
//                         color={COLORS.red}
//                         mb={1}
//                       >
//                         Missing Components in Triage
//                       </Typography>
//                       <Box component="ul" sx={{ mt: 0, mb: 0, pl: 3 }}>
//                         {pRemediation.missing_components_in_triage?.map(
//                           (c, i) => (
//                             <Typography
//                               component="li"
//                               variant="body2"
//                               key={i}
//                               sx={{
//                                 mb: 0.5,
//                                 color: COLORS.red,
//                                 fontWeight: 600,
//                               }}
//                             >
//                               {c}
//                             </Typography>
//                           ),
//                         )}
//                       </Box>
//                     </Box>
//                   </Box>
//                 </Paper>
//               )}

//               {/* SECTION 4: Review Summary */}
//               {pMarkdown && (
//                 <Paper
//                   elevation={0}
//                   sx={{
//                     p: 4,
//                     mb: 4,
//                     borderRadius: 2,
//                     border: `1px solid ${COLORS.lightGray}`,
//                   }}
//                 >
//                   <Box
//                     sx={{
//                       display: "flex",
//                       alignItems: "center",
//                       mb: 2,
//                       gap: 1.5,
//                     }}
//                   >
//                     <FileText color={COLORS.red} size={28} />
//                     <Typography
//                       variant="h5"
//                       sx={{ color: COLORS.blue, fontWeight: 700 }}
//                     >
//                       Review Summary
//                     </Typography>
//                     {isPolished && (
//                       <CheckCircle
//                         color={COLORS.success}
//                         size={22}
//                         style={{ marginLeft: "auto" }}
//                       />
//                     )}
//                   </Box>
//                   <Divider sx={{ mb: 3 }} />
//                   <MarkdownText text={cleanMarkdownText(pMarkdown)} />
//                 </Paper>
//               )}

//               {/* SECTION 5: Metrics & Graphs */}
//               {isPolished &&
//                 finalPayload?.metrics &&
//                 finalPayload?.ui_graphs && (
//                   <Fade in={true} timeout={1200}>
//                     <Box>
//                       <Box
//                         sx={{
//                           display: "flex",
//                           alignItems: "center",
//                           mb: 3,
//                           gap: 1.5,
//                           mt: 6,
//                         }}
//                       >
//                         <BarChart2 color={COLORS.red} size={32} />
//                         <Typography
//                           variant="h4"
//                           sx={{ color: COLORS.blue, fontWeight: 700 }}
//                         >
//                           Agent Telemetry Metrics
//                         </Typography>
//                       </Box>
//                       <Box
//                         sx={{
//                           display: "grid",
//                           gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
//                           gap: 4,
//                         }}
//                       >
//                         <Paper
//                           elevation={0}
//                           sx={{
//                             p: 3,
//                             border: `1px solid #e0e0e0`,
//                             borderRadius: 2,
//                           }}
//                         >
//                           <Typography
//                             variant="h6"
//                             sx={{
//                               color: COLORS.black,
//                               fontWeight: 600,
//                               mb: 3,
//                               textAlign: "center",
//                             }}
//                           >
//                             Token Distribution
//                           </Typography>
//                           <BarChart
//                             dataset={[
//                               {
//                                 agent: "Demographics",
//                                 input:
//                                   finalPayload.metrics.demographics_and_rag
//                                     ?.input_tokens || 0,
//                                 output:
//                                   finalPayload.metrics.demographics_and_rag
//                                     ?.output_tokens || 0,
//                               },
//                               {
//                                 agent: "Image Analyzer",
//                                 input:
//                                   finalPayload.metrics.image_analyzer_v4
//                                     ?.input_tokens || 0,
//                                 output:
//                                   finalPayload.metrics.image_analyzer_v4
//                                     ?.output_tokens || 0,
//                               },
//                               {
//                                 agent: "Remediation",
//                                 input:
//                                   finalPayload.metrics.remediation
//                                     ?.input_tokens || 0,
//                                 output:
//                                   finalPayload.metrics.remediation
//                                     ?.output_tokens || 0,
//                               },
//                               {
//                                 agent: "Formatter",
//                                 input:
//                                   finalPayload.metrics.formatter
//                                     ?.input_tokens || 0,
//                                 output:
//                                   finalPayload.metrics.formatter
//                                     ?.output_tokens || 0,
//                               },
//                             ]}
//                             xAxis={[{ scaleType: "band", dataKey: "agent" }]}
//                             series={[
//                               {
//                                 dataKey: "input",
//                                 label: "Input",
//                                 color: "#8884d8",
//                                 stack: "total",
//                               },
//                               {
//                                 dataKey: "output",
//                                 label: "Output",
//                                 color: "#82ca9d",
//                                 stack: "total",
//                               },
//                             ]}
//                             height={350}
//                           />
//                         </Paper>
//                         <Paper
//                           elevation={0}
//                           sx={{
//                             p: 3,
//                             border: `1px solid #e0e0e0`,
//                             borderRadius: 2,
//                           }}
//                         >
//                           <Typography
//                             variant="h6"
//                             sx={{
//                               color: COLORS.black,
//                               fontWeight: 600,
//                               mb: 1,
//                               textAlign: "center",
//                             }}
//                           >
//                             Quality Matrix (Max: 10)
//                           </Typography>
//                           <ResponsiveContainer width="100%" height={350}>
//                             <RadarChart
//                               cx="50%"
//                               cy="50%"
//                               outerRadius="70%"
//                               data={[
//                                 {
//                                   subject: "Accuracy",
//                                   Demographics:
//                                     finalPayload.ui_graphs.agent_metrics
//                                       ?.demographics?.scores?.accuracy || 0,
//                                   Image:
//                                     finalPayload.ui_graphs.agent_metrics
//                                       ?.image_analyzer?.scores?.accuracy || 0,
//                                   Remediation:
//                                     finalPayload.ui_graphs.agent_metrics
//                                       ?.remediation?.scores?.accuracy || 0,
//                                   Formatter:
//                                     finalPayload.ui_graphs.agent_metrics
//                                       ?.formatting?.scores?.accuracy || 0,
//                                   fullMark: 10,
//                                 },
//                                 {
//                                   subject: "Bias",
//                                   Demographics:
//                                     finalPayload.ui_graphs.agent_metrics
//                                       ?.demographics?.scores?.bias || 0,
//                                   Image:
//                                     finalPayload.ui_graphs.agent_metrics
//                                       ?.image_analyzer?.scores?.bias || 0,
//                                   Remediation:
//                                     finalPayload.ui_graphs.agent_metrics
//                                       ?.remediation?.scores?.bias || 0,
//                                   Formatter:
//                                     finalPayload.ui_graphs.agent_metrics
//                                       ?.formatting?.scores?.bias || 0,
//                                   fullMark: 10,
//                                 },
//                                 {
//                                   subject: "Hallucination",
//                                   Demographics:
//                                     finalPayload.ui_graphs.agent_metrics
//                                       ?.demographics?.scores?.hallucination ||
//                                     0,
//                                   Image:
//                                     finalPayload.ui_graphs.agent_metrics
//                                       ?.image_analyzer?.scores?.hallucination ||
//                                     0,
//                                   Remediation:
//                                     finalPayload.ui_graphs.agent_metrics
//                                       ?.remediation?.scores?.hallucination || 0,
//                                   Formatter:
//                                     finalPayload.ui_graphs.agent_metrics
//                                       ?.formatting?.scores?.hallucination || 0,
//                                   fullMark: 10,
//                                 },
//                                 {
//                                   subject: "Confidence",
//                                   Demographics:
//                                     finalPayload.ui_graphs.agent_metrics
//                                       ?.demographics?.scores?.confidence || 0,
//                                   Image:
//                                     finalPayload.ui_graphs.agent_metrics
//                                       ?.image_analyzer?.scores?.confidence || 0,
//                                   Remediation:
//                                     finalPayload.ui_graphs.agent_metrics
//                                       ?.remediation?.scores?.confidence || 0,
//                                   Formatter:
//                                     finalPayload.ui_graphs.agent_metrics
//                                       ?.formatting?.scores?.confidence || 0,
//                                   fullMark: 10,
//                                 },
//                               ]}
//                             >
//                               <PolarGrid stroke="#e0e0e0" />
//                               <PolarAngleAxis
//                                 dataKey="subject"
//                                 tick={{ fill: COLORS.blue, fontWeight: 600 }}
//                               />
//                               <PolarRadiusAxis angle={30} domain={[0, 10]} />
//                               <Radar
//                                 name="Demographics"
//                                 dataKey="Demographics"
//                                 stroke="#8884d8"
//                                 fill="#8884d8"
//                                 fillOpacity={0.3}
//                               />
//                               <Radar
//                                 name="Image Analyzer"
//                                 dataKey="Image"
//                                 stroke="#82ca9d"
//                                 fill="#82ca9d"
//                                 fillOpacity={0.3}
//                               />
//                               <Radar
//                                 name="Remediation"
//                                 dataKey="Remediation"
//                                 stroke="#ffc658"
//                                 fill="#ffc658"
//                                 fillOpacity={0.3}
//                               />
//                               <Radar
//                                 name="Formatter"
//                                 dataKey="Formatter"
//                                 stroke={COLORS.red}
//                                 fill={COLORS.red}
//                                 fillOpacity={0.3}
//                               />
//                               <RechartsTooltip />
//                               <Legend />
//                             </RadarChart>
//                           </ResponsiveContainer>
//                         </Paper>
//                       </Box>
//                     </Box>
//                   </Fade>
//                 )}
//             </Box>
//           </Fade>
//         )}
//         <div ref={endOfContentRef} style={{ height: 1 }} />
//       </Container>
//     </Box>
//   );
// };

// export default EAReview;

import React, { useState, useEffect, useRef } from "react";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  LinearProgress,
  Paper,
  Divider,
  Chip,
  Fade,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import {
  FolderSearch,
  Image as ImageIcon,
  Layers,
  FileText,
  BarChart2,
  CheckCircle,
} from "lucide-react";
import {
  getSession,
  startArchitectureReview,
} from "../services/AgenticService";
import Header from "../components/Header";
import MarkdownText from "../components/MarkdownText";
import AnimatedArchitectureFlow from "../components/Review/AnimatedArchitectureFlow";

const COLORS = {
  blue: "#002edc",
  red: "#D71920",
  black: "#000000",
  bg: "#F2F9FF",
  lightGray: "#f5f7fa",
  success: "#10b981",
};

// --- HELPER: Parse Markdown for Table & Clean Headers ---
const formatMarkdownText = (text) => {
  if (!text) return "";

  // 1. Remove "# Stage X: " prefixes
  let cleanText = text.replace(/# Stage \d+:\s*/g, "# ");

  // 2. Locate and convert "Best Practice Alignment" into a Markdown Table
  if (cleanText.includes("# Best Practice Alignment")) {
    const parts = cleanText.split("# Best Practice Alignment");
    const before = parts[0];
    const rest = parts[1];

    const subParts = rest.split(/# /);
    const alignmentRaw = subParts[0];
    const after =
      subParts.length > 1 ? "\n# " + subParts.slice(1).join("# ") : "";

    const lines = alignmentRaw.split("\n");
    let tableBody = "";
    let nonTableContent = "";

    lines.forEach((line) => {
      // Strip out all asterisks used for bold/italics
      const cleanLine = line.replace(/\*/g, "").trim();

      if (cleanLine.includes(":")) {
        const splitIndex = cleanLine.indexOf(":");
        const category = cleanLine.substring(0, splitIndex).trim();
        const components = cleanLine.substring(splitIndex + 1).trim();
        tableBody += `| **${category}** | ${components} |\n`;
      } else if (cleanLine.length > 0) {
        nonTableContent += line + "\n";
      }
    });

    if (tableBody) {
      const tableHeader = "\n| Category | Aligned Components |\n|---|---|\n";
      const formattedAlignment =
        nonTableContent + tableHeader + tableBody + "\n";
      cleanText =
        before + "# Best Practice Alignment\n" + formattedAlignment + after;
    }
  }
  return cleanText;
};

// --- HELPER: Safely parse JSON mid-stream ---
const parseBuffer = (buffer) => {
  try {
    const cleaned = buffer
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(cleaned);
  } catch (e) {
    return null;
  }
};

const EAReview = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // --- STREAM TIMELINE PHASES ---
  const [streamPhase, setStreamPhase] = useState("idle");
  const [apiError, setApiError] = useState(null);

  // --- DATA STATES ---
  const [activeStage, setActiveStage] = useState(null);
  const [streamedData, setStreamedData] = useState({
    demographics: null,
    image_analysis: null,
    remediation: null,
  });
  const [liveFormatterText, setLiveFormatterText] = useState("");
  const [finalPayload, setFinalPayload] = useState(null);

  // --- REFS ---
  const formatterTextRef = useRef("");
  const jsonBuffers = useRef({
    demographics_and_rag: "",
    image_analyzer_v4: "",
    remediation: "",
  });
  const formatterTimeoutRef = useRef(null);
  const lastProcessedRef = useRef(null);
  const endOfContentRef = useRef(null);

  // --- DYNAMIC ANIMATION TEXT ---
  const getStageText = (stage) => {
    switch (stage) {
      case "demographics_and_rag":
        return "Project Specifics Contextualization in progress...";
      case "image_analyzer_v4":
        return "Visual Architecture Intelligence in progress...";
      case "remediation":
        return "Semantic Consolidation & Gap Analysis in progress...";
      case "formatter":
        return "Drafting Executive Summary...";
      case "scorer":
        return "Running Quality Metrics...";
      default:
        return "Analyzing Architecture...";
    }
  };

  // --- SMOOTH TYPEWRITER QUEUE ---
  useEffect(() => {
    if (streamPhase !== "live_cards") return;

    const interval = setInterval(() => {
      setLiveFormatterText((prev) => {
        const target = formatterTextRef.current;
        if (prev.length < target.length) {
          const charsToAdd = target.slice(prev.length, prev.length + 5);
          return prev + charsToAdd;
        }
        return prev;
      });
    }, 15);
    return () => clearInterval(interval);
  }, [streamPhase]);

  // --- AUTO-SCROLL ---
  useEffect(() => {
    if (["live_cards", "finalizing", "polished"].includes(streamPhase)) {
      setTimeout(
        () =>
          endOfContentRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
          }),
        150,
      );
    }
  }, [liveFormatterText, streamPhase]);

  // --- INITIALIZATION & API INTEGRATION ---
  useEffect(() => {
    const initiateDataFetch = async () => {
      const sessionId = searchParams.get("id");
      const isNewReview = location.state?.triggerNewReview;

      const currentAction =
        sessionId || (isNewReview ? "NEW_REVIEW_TRIGGERED" : null);
      if (!currentAction || lastProcessedRef.current === currentAction) return;
      lastProcessedRef.current = currentAction;

      // SCENARIO 1: View History
      if (sessionId) {
        setStreamPhase("fetching");
        try {
          const data = await getSession(sessionId);
          setFinalPayload(data?.details || data);
          setStreamPhase("polished");
        } catch (error) {
          setApiError(error.message);
        }
        return;
      }

      // SCENARIO 2: Live Stream
      if (isNewReview && location.state?.payload) {
        setStreamPhase("connecting");
        setTimeout(() => setStreamPhase("animating"), 2000);

        const { title, description, file } = location.state.payload;
        try {
          await startArchitectureReview(title, description, file, {
            onStage: (data) => {
              if (data.type === "stage_start") {
                setActiveStage(data.executor);

                if (data.executor === "formatter") {
                  formatterTimeoutRef.current = setTimeout(() => {
                    setStreamedData({
                      demographics: parseBuffer(
                        jsonBuffers.current.demographics_and_rag,
                      ),
                      image_analysis: parseBuffer(
                        jsonBuffers.current.image_analyzer_v4,
                      ),
                      remediation: parseBuffer(jsonBuffers.current.remediation),
                    });
                    setStreamPhase("live_cards");
                  }, 2000);
                }
              }
            },
            onToken: (data) => {
              const id = data.executor_id;
              const text = data.text || "";
              if (
                [
                  "demographics_and_rag",
                  "image_analyzer_v4",
                  "remediation",
                ].includes(id)
              ) {
                jsonBuffers.current[id] += text;
              } else if (id === "formatter") {
                formatterTextRef.current += text;
              }
            },
            onFinal: (data) => {
              clearTimeout(formatterTimeoutRef.current);
              setFinalPayload(data?.details || data);
              setStreamPhase("finalizing");

              setTimeout(() => {
                setStreamPhase("polished");
                window.history.replaceState({}, document.title);
              }, 1500);
            },
            onError: (err) => {
              setApiError(err?.message);
              setStreamPhase("error");
            },
          });
        } catch (error) {
          setApiError(error.message);
          setStreamPhase("error");
        }
      }
    };
    initiateDataFetch();
  }, [location.state, searchParams]);

  if (apiError)
    return (
      <Box sx={{ p: 4, textAlign: "center", mt: 10 }}>
        <Typography variant="h5" color="error" gutterBottom>
          Analysis Failed
        </Typography>
        <Typography mb={3}>{apiError}</Typography>
        <Chip
          label="Go Back to Home"
          onClick={() => navigate("/home")}
          clickable
          color="primary"
        />
      </Box>
    );

  // --- DATA EXTRACTION ---
  const isPolished = streamPhase === "polished";
  const pDemographics = isPolished
    ? finalPayload?.raw_data?.demographics || finalPayload?.demographics
    : streamedData.demographics;
  const pImageAnalysis = isPolished
    ? finalPayload?.raw_data?.image_analysis ||
      finalPayload?.image_analysis_full_report
    : streamedData.image_analysis;
  const pRemediation = isPolished
    ? finalPayload?.raw_data?.remediation || finalPayload?.remediation
    : streamedData.remediation;
  const pMarkdown = isPolished
    ? finalPayload?.final_report_markdown || finalPayload?.final_markdown
    : liveFormatterText;

  const showCards = ["live_cards", "polished"].includes(streamPhase);

  // Combine Security Risks and Single Points of Failure
  const securityAndRisks = [
    ...(pImageAnalysis?.cxo_summary?.single_points_of_failure || []),
    ...(pImageAnalysis?.cxo_summary?.security_risks || []),
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        bgcolor: COLORS.bg,
      }}
    >
      <Header />

      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          bgcolor: "white",
          borderBottom: `1px solid ${COLORS.lightGray}`,
        }}
      >
        {[
          "fetching",
          "connecting",
          "animating",
          "live_cards",
          "finalizing",
        ].includes(streamPhase) && (
          <LinearProgress color="primary" sx={{ height: 4 }} />
        )}
        <Box
          sx={{
            py: 1,
            px: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          {["animating", "live_cards"].includes(streamPhase) && (
            <Chip
              label="Agent is actively analyzing..."
              size="small"
              sx={{
                bgcolor: COLORS.red,
                color: "white",
                fontWeight: "bold",
                animation: "pulse 1.5s infinite",
              }}
            />
          )}
          {streamPhase === "finalizing" && (
            <Chip
              label="Finalizing Report..."
              size="small"
              sx={{ bgcolor: COLORS.blue, color: "white", fontWeight: "bold" }}
            />
          )}
          {streamPhase === "polished" && (
            <Chip
              label="Review Complete"
              size="small"
              sx={{
                bgcolor: COLORS.success,
                color: "white",
                fontWeight: "bold",
              }}
            />
          )}
        </Box>
      </Box>

      <Container
        maxWidth="xl"
        sx={{ flex: 1, overflowY: "auto", py: 4, pb: 10 }}
      >
        {streamPhase === "connecting" && (
          <Box
            sx={{
              height: "60vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress
              size={60}
              thickness={4}
              sx={{ color: COLORS.blue, mb: 3 }}
            />
            <Typography variant="h5" fontWeight={700} color={COLORS.black}>
              Establishing connection to Agentic Backend...
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Initializing components and preparing architecture stream.
            </Typography>
          </Box>
        )}

        {streamPhase === "fetching" && (
          <Box sx={{ textAlign: "center", mt: 10 }}>
            <Typography variant="h6" color="text.secondary">
              Fetching historical logs...
            </Typography>
          </Box>
        )}

        {streamPhase === "animating" && (
          <Box
            sx={{
              height: "60vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AnimatedArchitectureFlow />
            <Typography
              variant="h5"
              fontWeight={700}
              color={COLORS.blue}
              sx={{ mt: 4, animation: "pulse 1.5s infinite" }}
            >
              {getStageText(activeStage)}
            </Typography>
          </Box>
        )}

        {streamPhase === "finalizing" && (
          <Box
            sx={{
              height: "60vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress
              size={60}
              thickness={4}
              sx={{ color: COLORS.success, mb: 3 }}
            />
            <Typography variant="h5" fontWeight={700} color={COLORS.black}>
              Consolidating Final Architecture Report...
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Applying security and compliance frameworks.
            </Typography>
          </Box>
        )}

        {showCards && (
          <Fade in={true} timeout={600}>
            <Box>
              {/* SECTION 1: Project Specifics */}
              {pDemographics && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    mb: 4,
                    border: `1px solid ${COLORS.lightGray}`,
                    borderRadius: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 2,
                      gap: 1.5,
                    }}
                  >
                    <FolderSearch color={COLORS.red} size={28} />
                    <Typography
                      variant="h5"
                      sx={{ color: COLORS.blue, fontWeight: 700 }}
                    >
                      Project Specifics
                    </Typography>
                    {isPolished && (
                      <CheckCircle
                        color={COLORS.success}
                        size={22}
                        style={{ marginLeft: "auto" }}
                      />
                    )}
                  </Box>
                  <Divider sx={{ mb: 3 }} />
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                    {Object.entries(pDemographics).map(([key, val]) => (
                      <Box
                        key={key}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          minWidth: 150,
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            textTransform: "uppercase",
                            fontWeight: 700,
                            mb: 0.5,
                          }}
                        >
                          {key.replace(/_/g, " ")}
                        </Typography>
                        <Chip
                          label={String(val)}
                          sx={{
                            bgcolor: COLORS.lightGray,
                            color: COLORS.black,
                            fontWeight: 600,
                            borderRadius: 1,
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Paper>
              )}

              {/* SECTION 2: Image Analysis */}
              {pImageAnalysis && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    mb: 4,
                    border: `1px solid ${COLORS.lightGray}`,
                    borderRadius: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 2,
                      gap: 1.5,
                    }}
                  >
                    <ImageIcon color={COLORS.red} size={28} />
                    <Typography
                      variant="h5"
                      sx={{ color: COLORS.blue, fontWeight: 700 }}
                    >
                      Image Analysis
                    </Typography>
                    {isPolished && (
                      <CheckCircle
                        color={COLORS.success}
                        size={22}
                        style={{ marginLeft: "auto" }}
                      />
                    )}
                  </Box>
                  <Divider sx={{ mb: 3 }} />

                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                  >
                    {pImageAnalysis.cxo_summary
                      ?.architecture_pattern_identified && (
                      <Box>
                        <Typography
                          variant="subtitle1"
                          fontWeight={700}
                          color={COLORS.black}
                          mb={0.5}
                        >
                          Architecture Pattern Identified
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            bgcolor: COLORS.lightGray,
                            p: 2,
                            borderRadius: 1,
                          }}
                        >
                          {
                            pImageAnalysis.cxo_summary
                              .architecture_pattern_identified
                          }
                        </Typography>
                      </Box>
                    )}

                    {pImageAnalysis.cxo_summary?.network_isolation_mechanisms &&
                      pImageAnalysis.cxo_summary.network_isolation_mechanisms
                        .length > 0 && (
                        <Box>
                          <Typography
                            variant="subtitle1"
                            fontWeight={700}
                            color={COLORS.black}
                            mb={0.5}
                          >
                            Network Topology
                          </Typography>
                          <Box component="ul" sx={{ mt: 0, mb: 0, pl: 3 }}>
                            {pImageAnalysis.cxo_summary.network_isolation_mechanisms.map(
                              (item, i) => (
                                <Typography
                                  component="li"
                                  variant="body2"
                                  key={i}
                                  sx={{ mb: 0.5, color: COLORS.black }}
                                >
                                  {item}
                                </Typography>
                              ),
                            )}
                          </Box>
                        </Box>
                      )}

                    {securityAndRisks.length > 0 && (
                      <Box>
                        <Typography
                          variant="subtitle1"
                          fontWeight={700}
                          color={COLORS.black}
                          mb={0.5}
                        >
                          Security and Risk Assessment Overview
                        </Typography>
                        <Box component="ul" sx={{ mt: 0, mb: 0, pl: 3 }}>
                          {securityAndRisks.map((item, i) => (
                            <Typography
                              component="li"
                              variant="body2"
                              key={i}
                              sx={{ mb: 0.5, color: COLORS.black }}
                            >
                              {item}
                            </Typography>
                          ))}
                        </Box>
                      </Box>
                    )}

                    {pImageAnalysis.qa_audit && (
                      <Box>
                        <Typography
                          variant="subtitle1"
                          fontWeight={700}
                          color={COLORS.black}
                          mb={0.5}
                        >
                          QA Coverage
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            bgcolor: "#fff3e0",
                            p: 2,
                            borderRadius: 1,
                            border: "1px solid #ffe0b2",
                          }}
                        >
                          Detected{" "}
                          {
                            pImageAnalysis.qa_audit.deterministic_metrics
                              ?.total_components_detected
                          }{" "}
                          components. Graph Coverage:{" "}
                          {
                            pImageAnalysis.qa_audit.deterministic_metrics
                              ?.graph_coverage_percentage
                          }
                          %.
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              )}

              {/* SECTION 3: Remediation / Missing Components */}
              {pRemediation && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    mb: 4,
                    border: `1px solid ${COLORS.lightGray}`,
                    borderRadius: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 2,
                      gap: 1.5,
                    }}
                  >
                    <Layers color={COLORS.red} size={28} />
                    <Typography
                      variant="h5"
                      sx={{ color: COLORS.blue, fontWeight: 700 }}
                    >
                      Missing components as per Blueprints
                    </Typography>
                    {isPolished && (
                      <CheckCircle
                        color={COLORS.success}
                        size={22}
                        style={{ marginLeft: "auto" }}
                      />
                    )}
                  </Box>
                  <Divider sx={{ mb: 3 }} />

                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {pRemediation.missing_components_in_triage?.map((c, i) => (
                      <Chip
                        key={i}
                        label={c}
                        size="medium"
                        sx={{
                          bgcolor: "#ffebee",
                          color: COLORS.red,
                          fontWeight: 600,
                        }}
                      />
                    ))}
                    {(!pRemediation.missing_components_in_triage ||
                      pRemediation.missing_components_in_triage.length ===
                        0) && (
                      <Typography variant="body2" color="text.secondary">
                        No missing components identified.
                      </Typography>
                    )}
                  </Box>
                </Paper>
              )}

              {/* SECTION 4: Review Summary (Markdown) */}
              {pMarkdown && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    mb: 4,
                    borderRadius: 2,
                    border: `1px solid ${COLORS.lightGray}`,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 2,
                      gap: 1.5,
                    }}
                  >
                    <FileText color={COLORS.red} size={28} />
                    <Typography
                      variant="h5"
                      sx={{ color: COLORS.blue, fontWeight: 700 }}
                    >
                      Review Summary
                    </Typography>
                    {isPolished && (
                      <CheckCircle
                        color={COLORS.success}
                        size={22}
                        style={{ marginLeft: "auto" }}
                      />
                    )}
                  </Box>
                  <Divider sx={{ mb: 3 }} />

                  {/* Pass the parsed table format only when fully polished. Otherwise stream raw text. */}
                  <MarkdownText
                    text={
                      isPolished
                        ? formatMarkdownText(pMarkdown)
                        : cleanMarkdownText(liveFormatterText)
                    }
                  />
                </Paper>
              )}

              {/* SECTION 5: Metrics & Graphs */}
              {isPolished &&
                finalPayload?.metrics &&
                finalPayload?.ui_graphs && (
                  <Fade in={true} timeout={1200}>
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 3,
                          gap: 1.5,
                          mt: 6,
                        }}
                      >
                        <BarChart2 color={COLORS.red} size={32} />
                        <Typography
                          variant="h4"
                          sx={{ color: COLORS.blue, fontWeight: 700 }}
                        >
                          Agent Telemetry Metrics
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
                          gap: 4,
                        }}
                      >
                        <Paper
                          elevation={0}
                          sx={{
                            p: 3,
                            border: `1px solid #e0e0e0`,
                            borderRadius: 2,
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{
                              color: COLORS.black,
                              fontWeight: 600,
                              mb: 3,
                              textAlign: "center",
                            }}
                          >
                            Token Distribution
                          </Typography>
                          <BarChart
                            dataset={[
                              {
                                agent: "Demographics",
                                input:
                                  finalPayload.metrics.demographics_and_rag
                                    ?.input_tokens || 0,
                                output:
                                  finalPayload.metrics.demographics_and_rag
                                    ?.output_tokens || 0,
                              },
                              {
                                agent: "Image Analyzer",
                                input:
                                  finalPayload.metrics.image_analyzer_v4
                                    ?.input_tokens || 0,
                                output:
                                  finalPayload.metrics.image_analyzer_v4
                                    ?.output_tokens || 0,
                              },
                              {
                                agent: "Remediation",
                                input:
                                  finalPayload.metrics.remediation
                                    ?.input_tokens || 0,
                                output:
                                  finalPayload.metrics.remediation
                                    ?.output_tokens || 0,
                              },
                              {
                                agent: "Formatter",
                                input:
                                  finalPayload.metrics.formatter
                                    ?.input_tokens || 0,
                                output:
                                  finalPayload.metrics.formatter
                                    ?.output_tokens || 0,
                              },
                            ]}
                            xAxis={[{ scaleType: "band", dataKey: "agent" }]}
                            series={[
                              {
                                dataKey: "input",
                                label: "Input",
                                color: "#8884d8",
                                stack: "total",
                              },
                              {
                                dataKey: "output",
                                label: "Output",
                                color: "#82ca9d",
                                stack: "total",
                              },
                            ]}
                            height={350}
                          />
                        </Paper>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 3,
                            border: `1px solid #e0e0e0`,
                            borderRadius: 2,
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{
                              color: COLORS.black,
                              fontWeight: 600,
                              mb: 1,
                              textAlign: "center",
                            }}
                          >
                            Quality Matrix (Max: 10)
                          </Typography>
                          <ResponsiveContainer width="100%" height={350}>
                            <RadarChart
                              cx="50%"
                              cy="50%"
                              outerRadius="70%"
                              data={[
                                {
                                  subject: "Accuracy",
                                  Demographics:
                                    finalPayload.ui_graphs.agent_metrics
                                      ?.demographics?.scores?.accuracy || 0,
                                  Image:
                                    finalPayload.ui_graphs.agent_metrics
                                      ?.image_analyzer?.scores?.accuracy || 0,
                                  Remediation:
                                    finalPayload.ui_graphs.agent_metrics
                                      ?.remediation?.scores?.accuracy || 0,
                                  Formatter:
                                    finalPayload.ui_graphs.agent_metrics
                                      ?.formatting?.scores?.accuracy || 0,
                                  fullMark: 10,
                                },
                                {
                                  subject: "Bias",
                                  Demographics:
                                    finalPayload.ui_graphs.agent_metrics
                                      ?.demographics?.scores?.bias || 0,
                                  Image:
                                    finalPayload.ui_graphs.agent_metrics
                                      ?.image_analyzer?.scores?.bias || 0,
                                  Remediation:
                                    finalPayload.ui_graphs.agent_metrics
                                      ?.remediation?.scores?.bias || 0,
                                  Formatter:
                                    finalPayload.ui_graphs.agent_metrics
                                      ?.formatting?.scores?.bias || 0,
                                  fullMark: 10,
                                },
                                {
                                  subject: "Hallucination",
                                  Demographics:
                                    finalPayload.ui_graphs.agent_metrics
                                      ?.demographics?.scores?.hallucination ||
                                    0,
                                  Image:
                                    finalPayload.ui_graphs.agent_metrics
                                      ?.image_analyzer?.scores?.hallucination ||
                                    0,
                                  Remediation:
                                    finalPayload.ui_graphs.agent_metrics
                                      ?.remediation?.scores?.hallucination || 0,
                                  Formatter:
                                    finalPayload.ui_graphs.agent_metrics
                                      ?.formatting?.scores?.hallucination || 0,
                                  fullMark: 10,
                                },
                                {
                                  subject: "Confidence",
                                  Demographics:
                                    finalPayload.ui_graphs.agent_metrics
                                      ?.demographics?.scores?.confidence || 0,
                                  Image:
                                    finalPayload.ui_graphs.agent_metrics
                                      ?.image_analyzer?.scores?.confidence || 0,
                                  Remediation:
                                    finalPayload.ui_graphs.agent_metrics
                                      ?.remediation?.scores?.confidence || 0,
                                  Formatter:
                                    finalPayload.ui_graphs.agent_metrics
                                      ?.formatting?.scores?.confidence || 0,
                                  fullMark: 10,
                                },
                              ]}
                            >
                              <PolarGrid stroke="#e0e0e0" />
                              <PolarAngleAxis
                                dataKey="subject"
                                tick={{ fill: COLORS.blue, fontWeight: 600 }}
                              />
                              <PolarRadiusAxis angle={30} domain={[0, 10]} />
                              <Radar
                                name="Demographics"
                                dataKey="Demographics"
                                stroke="#8884d8"
                                fill="#8884d8"
                                fillOpacity={0.3}
                              />
                              <Radar
                                name="Image Analyzer"
                                dataKey="Image"
                                stroke="#82ca9d"
                                fill="#82ca9d"
                                fillOpacity={0.3}
                              />
                              <Radar
                                name="Remediation"
                                dataKey="Remediation"
                                stroke="#ffc658"
                                fill="#ffc658"
                                fillOpacity={0.3}
                              />
                              <Radar
                                name="Formatter"
                                dataKey="Formatter"
                                stroke={COLORS.red}
                                fill={COLORS.red}
                                fillOpacity={0.3}
                              />
                              <RechartsTooltip />
                              <Legend />
                            </RadarChart>
                          </ResponsiveContainer>
                        </Paper>
                      </Box>
                    </Box>
                  </Fade>
                )}
            </Box>
          </Fade>
        )}
        <div ref={endOfContentRef} style={{ height: 1 }} />
      </Container>
    </Box>
  );
};

export default EAReview;
