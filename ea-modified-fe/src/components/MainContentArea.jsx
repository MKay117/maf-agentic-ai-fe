import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  Container,
  Box,
  Snackbar,
  Alert,
  LinearProgress,
  Typography,
} from "@mui/material";

// Sub-components
import ChatInputWithUploads from "./ChatInputWithUploads";
import ReviewHeader from "./Review/ReviewHeader";
import ReviewLiveStatus from "./Review/ReviewLiveStatus";
import ReviewReport from "./Review/ReviewReport";
import FailureView from "./Review/FailureView";
import QualityMetricsModal from "./Review/QualityMetricsModal";

// Services & Utils
import {
  getSession,
  streamReview,
  uploadReview,
} from "@/services/AgenticService";
import {
  parseSuccessReview,
  extractSimilarityScore,
  extractAgentScores,
} from "@/utils/reviewUtils";
import { FileSearch } from "lucide-react";

const MainContentArea = ({ sessionId, onSessionCreated }) => {
  const location = useLocation();

  // --- 1. ROUTE CONFIGURATION ---
  const isStandardMode = location.pathname.includes("standard-review");
  const isRagMode = location.pathname.includes("ea-rag-review");

  // Dynamic Title & Description
  let pageTitle = "Architecture Review";
  let pageDesc = "Upload your artifacts for review.";
  let allowedFileTypes = ".json,.pdf,.png,.jpg,.jpeg,.webp"; // Default

  if (isStandardMode) {
    pageTitle = "Standard Architecture Review";
    pageDesc = "Upload Excel workbook and Architecture diagrams";
    allowedFileTypes = ".xlsx,.xls,.png,.jpg,.jpeg,.webp";
  } else if (isRagMode) {
    pageTitle = "Enterprise Architecture Review";
    pageDesc = "Upload JSON and Architecture diagrams for RAG analysis";
    allowedFileTypes = ".json,.png,.jpg,.jpeg,.webp";
  }

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
  const isViewOnly = Boolean(normalizedId);

  // --- API EFFECTS ---
  useEffect(() => {
    if (backendReview && backendReview.review_id === normalizedId) return;

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
  const agentScores = extractAgentScores(stageEvents, review);

  // Helper: Should we show the results view?
  const showResults = streaming || reviewLoaded || isViewOnly;

  // --- HANDLERS ---
  const handleSend = async (message, attachments) => {
    try {
      setStreaming(true);
      setStageEvents([]);
      setBackendReview(null);
      setSessionDetails(null);

      const callbacks = {
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
        onError: () => {
          setToast({
            open: true,
            severity: "error",
            message: "Review failed.",
          });
          setStreaming(false);
        },
      };

      const excelFile = attachments.find(
        (a) => a.name.match(/\.(xlsx|xls)$/i) && a.fileObj
      );

      if (excelFile) {
        await uploadReview(excelFile.fileObj, callbacks);
      } else {
        const single = attachments?.[0] ?? null;
        let metadataPayload = message?.trim()
          ? { text_content: message.trim() }
          : {};

        if (single?.type?.includes("json")) {
          metadataPayload =
            typeof single.content === "object"
              ? single.content
              : JSON.parse(single.content);
        } else if (
          single?.type?.startsWith("image/") ||
          single?.type === "application/pdf"
        ) {
          metadataPayload = { arch_img_url: single.content };
        } else if (single) {
          metadataPayload = { text_content: single.content };
        }

        if (message.trim() && !metadataPayload.text_content) {
          metadataPayload.text_content = message.trim();
        } else if (
          message.trim() &&
          metadataPayload.text_content !== message.trim()
        ) {
          metadataPayload.text_content += `\n\n${message.trim()}`;
        }

        await streamReview({ metadata: metadataPayload }, callbacks);
      }
    } catch (e) {
      console.error(e);
      setStreaming(false);
      setToast({
        open: true,
        severity: "error",
        message: "Failed to initiate review.",
      });
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
      {/* Loading Bar */}
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

      {/* --- SCROLLABLE CONTENT --- */}
      <Box
        sx={{
          width: "100%",
          mx: "auto",
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          mt: loadingSession ? 1 : 0,
        }}
      >
        {/* 1. EMPTY STATE TITLE (Only visible when NOT showing results) */}
        {!showResults && (
          <Box
            sx={{
              textAlign: "center",
              mt: 10,
              mb: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              opacity: 0.8,
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                bgcolor: "#eee",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                m: 2,
              }}
            >
              <FileSearch size={32} color="#000" />
            </Box>
            <Typography variant="h4" fontWeight={600} color="#000" gutterBottom>
              {pageTitle}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {pageDesc}
            </Typography>
          </Box>
        )}

        {/* 2. HEADER & RESULTS (Only visible when we have data) */}
        {showResults && (
          <>
            <ReviewHeader
              reviewId={review?.review_id}
              reviewLoaded={reviewLoaded}
              isViewOnly={isViewOnly}
              similarityScore={similarityScore}
              hasAgentScores={!!agentScores}
              onOpenGraph={() => setGraphOpen(true)}
              parsedExecutive={parsed?.executive}
              title={pageTitle}
              description={pageDesc}
            />
            {streaming && <ReviewLiveStatus activeEvent={activeEvent} />}
            {review?.status === "failure" ? (
              <FailureView summary={review.summary} issues={review.issues} />
            ) : (
              parsed && <ReviewReport parsedData={parsed} />
            )}
          </>
        )}
      </Box>

      {/* --- INPUT AREA --- */}
      {!isViewOnly && !streaming && (
        <Box sx={{ width: "80%", mx: "auto", pt: 2, mb: 3 }}>
          <ChatInputWithUploads
            onSend={handleSend}
            disabled={false}
            allowedTypes={allowedFileTypes} // Pass dynamic types
          />
        </Box>
      )}

      {/* Modals */}
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
