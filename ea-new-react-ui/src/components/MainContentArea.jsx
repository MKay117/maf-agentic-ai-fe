import { useState, useEffect, useMemo } from "react";
import { Container, Box, Snackbar, Alert, LinearProgress } from "@mui/material";

// Sub-components
import ChatInputWithUploads from "./ChatInputWithUploads";
import ReviewHeader from "./Review/ReviewHeader";
import ReviewLiveStatus from "./Review/ReviewLiveStatus";
import ReviewReport from "./Review/ReviewReport";
import FailureView from "./Review/FailureView";
import QualityMetricsModal from "./Review/QualityMetricsModal";

// Services & Utils
import { getSession, streamReview } from "@/services/AgenticService";
import {
  parseSuccessReview,
  extractSimilarityScore,
  extractAgentScores,
} from "@/utils/reviewUtils";

const MainContentArea = ({ sessionId, onSessionCreated }) => {
  // --- STATE ---
  const [sessionDetails, setSessionDetails] = useState(null);
  const [loadingSession, setLoadingSession] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    severity: "info",
    message: "",
  });

  const [streaming, setStreaming] = useState(false);
  const [stageEvents, setStageEvents] = useState([]);
  const [backendReview, setBackendReview] = useState(null);
  const [graphOpen, setGraphOpen] = useState(false);

  const normalizedId =
    typeof sessionId === "object" ? sessionId?.session_id : sessionId;

  // View Only if we have an ID or are currently streaming
  const isViewOnly = Boolean(normalizedId);

  // --- API EFFECTS ---
  useEffect(() => {
    // Optimization: Skip fetch if we already have the live data for this ID
    if (backendReview && backendReview.review_id === normalizedId) {
      return;
    }

    if (!normalizedId) {
      setSessionDetails(null);
      setBackendReview(null);
      setStageEvents([]);
      return;
    }

    const fetchSession = async () => {
      setLoadingSession(true);
      try {
        const data = await getSession(normalizedId);
        // Handle case where data might be nested under 'details' or direct
        setSessionDetails(data?.details || data || null);
      } catch {
        setToast({
          open: true,
          severity: "error",
          message: "Failed to load session.",
        });
      } finally {
        setLoadingSession(false);
      }
    };

    fetchSession();
  }, [normalizedId, backendReview]);

  // --- DERIVED DATA ---
  const activeEvent = useMemo(
    () => (stageEvents.length ? stageEvents[stageEvents.length - 1] : null),
    [stageEvents]
  );

  const review =
    backendReview || sessionDetails?.details || sessionDetails || null;

  const finalSummary = review?.summary || review?.formatting_summary || null;
  const similarityScore = extractSimilarityScore(finalSummary);
  const reviewLoaded = Boolean(finalSummary || review?.review_id);
  const parsed = reviewLoaded
    ? parseSuccessReview(
        typeof finalSummary === "string" ? finalSummary : finalSummary?.summary
      )
    : null;

  // We pass BOTH stageEvents (live) AND review (history log)
  const agentScores = extractAgentScores(stageEvents, review);

  // --- HANDLERS ---
  const handleSend = async (message, attachments) => {
    try {
      const single = attachments?.[0] ?? null;
      let metadataPayload = message?.trim()
        ? { text_content: message.trim() }
        : {};

      if (single?.type?.includes("json")) {
        metadataPayload = single.content;
      } else if (
        single?.type?.startsWith("image/") ||
        single?.type === "application/pdf"
      ) {
        metadataPayload = { arch_img_url: single.content };
      } else if (single) {
        metadataPayload = { text_content: single.content };
      }

      setStreaming(true);
      setStageEvents([]);
      setBackendReview(null);
      setSessionDetails(null);

      await streamReview(
        { metadata: metadataPayload },
        {
          onStage: (evt) => {
            if (evt) setStageEvents((p) => [...p, evt]);
          },
          onFinal: async (result) => {
            setBackendReview(result);
            if (result?.review_id) onSessionCreated?.(result.review_id);
            setToast({
              open: true,
              severity: "success",
              message: "Review completed.",
            });
            setStreaming(false);
          },
          onError: () => setStreaming(false),
        }
      );
    } catch {
      setStreaming(false);
    }
  };

  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        py: 2,
        position: "relative",
      }}
    >
      {/* --- NEW: LOADING ANIMATION (Only when switching history, NOT streaming) --- */}
      {loadingSession && !streaming && (
        <Box
          sx={{
            width: "100%",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 10,
          }}
        >
          <LinearProgress />
        </Box>
      )}

      <Box
        sx={{
          width: "100%",
          mx: "auto",
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden", // FIX: Forces no horizontal scroll
          mt: loadingSession ? 1 : 0,
        }}
      >
        {/* 1. HEADER */}
        {/* If loading, we might want to hide the old header or keep it. 
            Keeping it is usually better UX, but the LinearProgress shows activity. */}
        <ReviewHeader
          reviewId={review?.review_id}
          reviewLoaded={reviewLoaded}
          isViewOnly={isViewOnly}
          similarityScore={similarityScore}
          hasAgentScores={!!agentScores}
          onOpenGraph={() => setGraphOpen(true)}
          parsedExecutive={parsed?.executive}
        />

        {/* 2. LIVE STATUS */}
        {streaming && <ReviewLiveStatus activeEvent={activeEvent} />}

        {/* 3. REPORT BODY (Failure or Success) */}
        {review?.status === "failure" ? (
          <FailureView summary={review.summary} issues={review.issues} />
        ) : (
          parsed && <ReviewReport parsedData={parsed} />
        )}
      </Box>

      {/* 4. INPUT AREA - Hidden when streaming or viewing history */}
      {!isViewOnly && !streaming && (
        <Box sx={{ width: "70%", mx: "auto" }}>
          <ChatInputWithUploads onSend={handleSend} disabled={false} />
        </Box>
      )}

      {/* 5. MODAL & TOASTS */}
      <QualityMetricsModal
        open={graphOpen}
        onClose={() => setGraphOpen(false)}
        scores={agentScores}
      />

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
