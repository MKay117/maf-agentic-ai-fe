import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, TextField, Button, Paper, Divider, Chip } from "@mui/material";
import { UploadCloud, PlayCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { startReviewStream } from "../services/AgenticService";

// Helper component: Parses text. If valid JSON, shows Chips. If not, shows raw text.
const JsonChipRenderer = ({ text }) => {
  try {
    const parsed = JSON.parse(text);
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {Object.entries(parsed).map(([key, value]) => {
          if (typeof value === 'object') return null; // Keep it simple for top-level keys
          return (
            <Chip 
              key={key} 
              label={`${key}: ${value}`} 
              size="small" 
              sx={{ bgcolor: '#e3f2fd', color: '#002edc', fontWeight: 600, borderRadius: 1 }} 
            />
          );
        })}
      </Box>
    );
  } catch {
    return <Typography variant="body2" sx={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}>{text}</Typography>;
  }
};

const Dashboard = () => {
  const [sessionName, setSessionName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [status, setStatus] = useState("");
  const [streams, setStreams] = useState([]);
  const [finalReport, setFinalReport] = useState(null);
  const streamEndRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleRunAnalysis = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsStreaming(true);
    setStreams([]);
    setFinalReport(null);
    setStatus("Initializing Pipeline...");

    try {
      await startReviewStream(
        { file, sessionName, description },
        {
          onStage: (event, data) => {
            if (event === "stage_start") {
              setStreams(prev => [...prev, { id: data.executor, text: "", complete: false }]);
              setStatus(`Running: ${data.executor}`);
            }
            if (event === "stage_complete") {
              setStreams(prev => prev.map(s => s.id === data.executor ? { ...s, complete: true } : s));
            }
          },
          onToken: (data) => {
            setStreams(prev => prev.map(s => 
              s.id === data.executor_id ? { ...s, text: s.text + data.text } : s
            ));
          },
          onFinal: (data) => {
            setFinalReport(data);
            setStatus("Review Complete");
          },
          onError: (errMsg) => {
            setStatus(`Error: ${errMsg}`);
          }
        }
      );
    } catch (err) {
      setStatus(`Failed: ${err.message}`);
    }
  };

  useEffect(() => {
    if (streamEndRef.current) streamEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [streams, finalReport]);

  return (
    <Box sx={{ display: "flex", height: "calc(100vh - 64px)", bgcolor: "#f4f6f8" }}>
      
      {/* LEFT PANEL - 40% Width */}
      <Box sx={{ width: "40%", height: "100%", p: 4, bgcolor: "#ffffff", borderRight: "1px solid #e0e0e0", overflowY: "auto" }}>
        <Typography variant="h6" fontWeight={700} color="#002edc" mb={3}>New Analysis</Typography>
        
        <form onSubmit={handleRunAnalysis} style={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="caption" fontWeight={600} color="text.secondary" mb={0.5}>Application / Session Name</Typography>
          <TextField fullWidth size="small" value={sessionName} onChange={(e) => setSessionName(e.target.value)} sx={{ mb: 3 }} required />

          <Typography variant="caption" fontWeight={600} color="text.secondary" mb={0.5}>Description / Context</Typography>
          <TextField fullWidth multiline rows={3} value={description} onChange={(e) => setDescription(e.target.value)} sx={{ mb: 3 }} />

          <Typography variant="caption" fontWeight={600} color="text.secondary" mb={0.5}>Artifacts</Typography>
          <Box sx={{
            border: '2px dashed #ccc', borderRadius: 2, p: 4, textAlign: 'center', mb: 4, cursor: 'pointer',
            bgcolor: file ? '#f0f8ff' : '#fafafa', borderColor: file ? '#002edc' : '#ccc'
          }} onClick={() => document.getElementById('file-upload').click()}>
            <input id="file-upload" type="file" accept=".xlsx,.xls,.json" style={{ display: "none" }} onChange={handleFileChange} />
            <UploadCloud size={32} color={file ? "#002edc" : "#999"} style={{ marginBottom: 8 }} />
            <Typography variant="body2" fontWeight={600} color={file ? "#002edc" : "text.secondary"}>
              {file ? file.name : "Drag & Drop files here"}
            </Typography>
          </Box>

          <Button type="submit" variant="contained" disabled={!file || isStreaming && !finalReport} startIcon={<PlayCircle />}
            sx={{ py: 1.5, bgcolor: "#002edc", fontWeight: 700, '&:hover': { bgcolor: "#001a99" } }}>
            Run Architecture Review
          </Button>
        </form>
      </Box>

      {/* RIGHT PANEL - 60% Width */}
      <Box sx={{ width: "60%", height: "100%", p: 4, overflowY: "auto", bgcolor: "#f4f6f8" }}>
        
        {/* If Not Streaming: Show History */}
        {!isStreaming && !finalReport && (
          <Box>
            <Typography variant="h6" fontWeight={700} color="#333" mb={3}>Review History</Typography>
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderStyle: 'dashed' }}>
              <Typography color="text.secondary">No previous reviews selected.</Typography>
            </Paper>
          </Box>
        )}

        {/* If Streaming: Blank canvas that scrolls down */}
        {(isStreaming || finalReport) && (
          <Box>
            <Typography variant="caption" fontWeight={700} color="#002edc" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 2, display: 'block' }}>
              Status: {status}
            </Typography>

            {streams.map((stream, idx) => (
              <Box key={idx} sx={{ mb: 4 }}>
                <Typography variant="subtitle2" fontWeight={700} color="#555" mb={1} sx={{ textTransform: 'uppercase' }}>
                  {stream.id.replace(/_/g, ' ')}
                </Typography>
                
                {/* If stage complete, render Chips. If still streaming, render raw text */}
                {stream.complete ? (
                  <JsonChipRenderer text={stream.text} />
                ) : (
                  <Typography variant="body2" sx={{ fontFamily: "monospace", whiteSpace: "pre-wrap", color: "#333" }}>
                    {stream.text} ▌
                  </Typography>
                )}
                <Divider sx={{ mt: 2 }} />
              </Box>
            ))}

            {finalReport && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" fontWeight={700} color="#002edc" mb={2}>Final Report</Typography>
                <Paper elevation={0} sx={{ p: 3, borderLeft: '4px solid #002edc', bgcolor: '#fff' }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {finalReport.final_markdown}
                  </ReactMarkdown>
                </Paper>
              </Box>
            )}

            <div ref={streamEndRef} style={{ height: "40px" }} />
          </Box>
        )}
      </Box>

    </Box>
  );
};

export default Dashboard;