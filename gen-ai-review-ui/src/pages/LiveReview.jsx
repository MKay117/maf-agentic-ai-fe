import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Grid,
  LinearProgress,
  Divider,
  Chip,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { startReviewStream } from "../services/AgenticService";

const LiveReview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bottomRef = useRef(null);
  const hasStarted = useRef(false);

  const [status, setStatus] = useState("Initializing Pipeline...");
  const [error, setError] = useState(null);

  // Sequential Streaming State
  const [streams, setStreams] = useState({
    demographics: "",
    image: "",
    remediation: "",
    formatter: "",
  });

  // Final Data State
  const [finalReport, setFinalReport] = useState(null);

  useEffect(() => {
    // Only run once when the page loads
    if (hasStarted.current) return;

    // Check if we came from the Dashboard with a file
    const { file, sessionName, description } = location.state || {};
    if (!file) {
      navigate("/home");
      return;
    }

    hasStarted.current = true;

    const runStream = async () => {
      try {
        await startReviewStream(
          { file, sessionName, description },
          {
            onStage: (event, data) => {
              if (event === "stage_start")
                setStatus(`Running Stage: ${data.executor}...`);
              if (event === "stage_complete")
                setStatus(`Completed Stage: ${data.executor}`);
            },
            onToken: (data) => {
              const { executor_id, text } = data;
              setStreams((prev) => {
                const newState = { ...prev };
                if (executor_id.includes("demographics"))
                  newState.demographics += text;
                else if (executor_id.includes("image")) newState.image += text;
                else if (executor_id.includes("remediation"))
                  newState.remediation += text;
                else if (executor_id.includes("formatter"))
                  newState.formatter += text;
                return newState;
              });
            },
            onFinal: (data) => {
              setFinalReport(data);
              setStatus("Review Complete!");
            },
            onError: (errMsg) => {
              setError(errMsg);
              setStatus("Pipeline Halted.");
            },
          },
        );
      } catch (err) {
        setError(err.message);
        setStatus("Failed to start.");
      }
    };

    runStream();
  }, [location, navigate]);

  // Auto-scroll as content arrives
  useEffect(() => {
    if (bottomRef.current)
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [streams, finalReport]);

  // Helper to format the CXO Graph Data from the Backend metrics snowball
  const formatChartData = () => {
    if (!finalReport || !finalReport.metrics)
      return { timeData: [], tokenData: [] };

    const metrics = finalReport.metrics;
    const timeData = [];
    const tokenData = [];

    // Order of execution
    const keys = [
      "input_validator",
      "demographics_and_rag",
      "image_analyzer",
      "remediation_comparison",
      "image_graph_builder",
      "formatter",
      "scorer",
    ];

    keys.forEach((key) => {
      if (metrics[key]) {
        timeData.push({
          stage: key.split("_")[0],
          duration: metrics[key].duration_seconds || 0,
        });
        if (metrics[key].total_tokens > 0) {
          tokenData.push({
            id: key,
            value: metrics[key].total_tokens,
            label: key.split("_")[0],
          });
        }
      }
    });

    return { timeData, tokenData };
  };

  const { timeData, tokenData } = formatChartData();

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        height: "100%",
        overflowY: "auto",
        bgcolor: "background.default",
      }}
    >
      {/* Top Status Bar */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" color="primary.main" fontWeight={700}>
          {location.state?.sessionName || "Active Review Session"}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Pipeline Status:{" "}
          <strong style={{ color: error ? "#ff007f" : "#00ff9d" }}>
            {status}
          </strong>
        </Typography>
        {!finalReport && !error && (
          <LinearProgress color="secondary" sx={{ mt: 1, height: 2 }} />
        )}
      </Box>

      {error && (
        <Paper
          sx={{
            p: 2,
            mb: 3,
            borderLeft: "4px solid",
            borderColor: "error.main",
            bgcolor: "rgba(255,0,127,0.05)",
          }}
        >
          <Typography color="error.main" fontWeight={600}>
            Critical Error: {error}
          </Typography>
        </Paper>
      )}

      {/* The Sequential Stream View */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {/* Row 1: Demographics & Image Analysis */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              height: "100%",
              minHeight: 200,
              bgcolor: "background.paper",
            }}
          >
            <Typography
              variant="caption"
              color="primary.main"
              fontWeight={700}
              sx={{ textTransform: "uppercase" }}
            >
              1. Demographics & RAG
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Box
              sx={{
                fontFamily: "monospace",
                fontSize: "0.85rem",
                whiteSpace: "pre-wrap",
                color: "text.primary",
              }}
            >
              {streams.demographics || (
                <span style={{ color: "#6c7993" }}>
                  Waiting for orchestrator...
                </span>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              height: "100%",
              minHeight: 200,
              bgcolor: "background.paper",
            }}
          >
            <Typography
              variant="caption"
              color="secondary.main"
              fontWeight={700}
              sx={{ textTransform: "uppercase" }}
            >
              2. Vision AI Extractor
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Box
              sx={{
                fontFamily: "monospace",
                fontSize: "0.85rem",
                whiteSpace: "pre-wrap",
                color: "text.primary",
              }}
            >
              {streams.image || (
                <span style={{ color: "#6c7993" }}>
                  Pending stage 1 completion...
                </span>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Row 2: Remediation */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, minHeight: 150, bgcolor: "background.paper" }}>
            <Typography
              variant="caption"
              color="warning.main"
              fontWeight={700}
              sx={{ textTransform: "uppercase" }}
            >
              3. Semantic Remediation
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Box
              sx={{
                fontFamily: "monospace",
                fontSize: "0.85rem",
                whiteSpace: "pre-wrap",
                color: "text.primary",
              }}
            >
              {streams.remediation || (
                <span style={{ color: "#6c7993" }}>
                  Pending stage 2 completion...
                </span>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* FINAL OUTPUT & CXO DASHBOARD */}
      {finalReport && (
        <Box sx={{ animation: "fadeIn 1s ease-in" }}>
          {/* Executive Markdown Report */}
          <Paper
            sx={{
              p: 4,
              mb: 4,
              borderLeft: "4px solid",
              borderColor: "primary.main",
            }}
          >
            <Box
              sx={{
                "& h1": {
                  color: "primary.main",
                  fontSize: "1.2rem",
                  mt: 2,
                  mb: 1,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                },
                "& ul": { color: "text.secondary", pl: 3 },
                "& strong": { color: "text.primary" },
              }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {finalReport.final_markdown}
              </ReactMarkdown>
            </Box>
          </Paper>

          {/* CXO Metrics Dashboard */}
          <Typography variant="h6" color="text.primary" fontWeight={700} mb={2}>
            CXO Telemetry Dashboard
          </Typography>
          <Grid container spacing={3}>
            {/* Chart 1: Response Times */}
            <Grid item xs={12} md={7}>
              <Paper
                sx={{
                  p: 2,
                  height: 350,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography variant="caption" color="text.secondary" mb={2}>
                  Agent Execution Latency (Seconds)
                </Typography>
                <Box
                  sx={{ flexGrow: 1, "& text": { fill: "#fff !important" } }}
                >
                  <BarChart
                    dataset={timeData}
                    xAxis={[{ scaleType: "band", dataKey: "stage" }]}
                    series={[{ dataKey: "duration", color: "#00f2ff" }]}
                    margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
                  />
                </Box>
              </Paper>
            </Grid>

            {/* Chart 2: Token Usage */}
            <Grid item xs={12} md={5}>
              <Paper
                sx={{
                  p: 2,
                  height: 350,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  mb={2}
                  alignSelf="flex-start"
                >
                  LLM Token Consumption by Agent
                </Typography>
                <Box
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    alignItems: "center",
                    "& text": { fill: "#fff !important" },
                  }}
                >
                  <PieChart
                    series={[
                      {
                        data: tokenData,
                        innerRadius: 40,
                        outerRadius: 100,
                        paddingAngle: 5,
                        cornerRadius: 5,
                      },
                    ]}
                    width={400}
                    height={200}
                    colors={[
                      "#00f2ff",
                      "#9d00ff",
                      "#ff007f",
                      "#00ff9d",
                      "#ffea00",
                    ]}
                    margin={{ right: 150 }}
                  />
                </Box>
              </Paper>
            </Grid>

            {/* Chart 3: Quality Scores */}
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 3,
                  display: "flex",
                  justifyContent: "space-around",
                  alignItems: "center",
                  bgcolor: "rgba(0, 242, 255, 0.05)",
                }}
              >
                {Object.entries(finalReport.scores || {}).map(
                  ([key, value]) => {
                    if (key === "notes" || key === "error") return null;
                    return (
                      <Box key={key} textAlign="center">
                        <Typography
                          variant="h4"
                          color="primary.main"
                          fontWeight={800}
                        >
                          {value}/10
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ textTransform: "uppercase", letterSpacing: 1 }}
                        >
                          {key}
                        </Typography>
                      </Box>
                    );
                  },
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Auto-scroll anchor */}
      <div ref={bottomRef} style={{ height: "40px" }} />
    </Box>
  );
};

export default LiveReview;
