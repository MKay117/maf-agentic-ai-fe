import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import HistoryIcon from "@mui/icons-material/History";

import SessionList from "./SessionList";
import { getAllSessions, getSessions } from "@/services/AgenticService";

const PAGE_SIZE = 10;

// NEW: Accept refreshTrigger prop
const Sidebar = ({
  selectedSession,
  onSessionSelect,
  onNewChat,
  refreshTrigger,
}) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [timeframe] = useState("all");
  const listContainerRef = useRef(null);
  const location = useLocation();

  const getReviewTypeFilter = () => {
    const path = location.pathname;
    if (path.includes("standard-review")) return "Standard Review";
    if (path.includes("ea-rag-review")) return "RAG Review";
    return null; // Show all if on Home or unknown route
  };

  const ensureSessionDate = (session) => {
    if (session?.date) return session.date;
    const p = session?.path;
    if (typeof p === "string") {
      const parts = p.split("/");
      if (parts.length >= 2 && /^\d{2}-\d{2}-\d{4}$/.test(parts[1])) {
        return parts[1];
      }
    }
    return null;
  };

  const fetchPage = useCallback(
    async (pageToFetch = 1) => {
      pageToFetch === 1 ? setLoading(true) : setLoadingMore(true);

      try {
        const reviewType = getReviewTypeFilter(); // <--- GET FILTER

        const resp =
          timeframe === "all"
            ? await getAllSessions(pageToFetch, PAGE_SIZE, reviewType) // <--- PASS FILTER
            : await getSessions(timeframe, pageToFetch, PAGE_SIZE); // (Optional: apply filter here too if needed)

        const items = Array.isArray(resp?.items) ? resp.items : [];
        const normalized = items.map((it) => ({
          ...it,
          date: ensureSessionDate(it),
        }));

        if (pageToFetch === 1) {
          setSessions(normalized);
        } else {
          setSessions((prev) => [...prev, ...normalized]);
        }

        setHasMore(
          resp?.total != null
            ? pageToFetch * PAGE_SIZE < resp.total
            : items.length === PAGE_SIZE,
        );
      } catch (e) {
        console.error("Failed to fetch sessions:", e);
        setHasMore(false);
      } finally {
        pageToFetch === 1 ? setLoading(false) : setLoadingMore(false);
      }
    },
    [timeframe, location.pathname], // <--- Re-fetch when URL changes
  );

  // Re-fetch when refreshTrigger OR location changes
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setSessions([]); // Clear list visually when switching contexts
    fetchPage(1);
  }, [fetchPage, refreshTrigger, location.pathname]);

  useEffect(() => {
    const el = listContainerRef.current;
    if (!el) return;

    const onScroll = () => {
      if (
        el.scrollTop + el.clientHeight >= el.scrollHeight - 60 &&
        hasMore &&
        !loadingMore &&
        !loading
      ) {
        const next = page + 1;
        setPage(next);
        fetchPage(next);
      }
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [fetchPage, hasMore, loadingMore, loading, page]);

  const handleSessionSelect = useCallback(
    (session) => {
      if (!session) return;
      // Safety check for path parsing
      const parts = (session.month_year || "").split(" ");
      const month = parts[0] || "";
      const year = parts[1] || "";

      onSessionSelect({
        session_id: session.session_id,
        date: session.date,
        month,
        year,
      });
    },
    [onSessionSelect],
  );

  const historyTitle =
    // location.pathname.includes("ea-rag-review")
    //   ? "RAG History"
    //   : location.pathname.includes("standard-review")
    //   ? "Standard History"
    //   :
    "Review History";

  return (
    <Box
      sx={{
        width: 300,
        borderRight: "1px solid",
        borderColor: "divider",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: 2, m: 2 }}>
        <Button
          fullWidth
          onClick={onNewChat}
          startIcon={<AddIcon />}
          variant="outlined"
          sx={{
            fontWeight: 600,
            color: "primary.main",
            borderColor: "primary.main",
            "&:hover": {
              backgroundColor: "primary.main",
              color: "#fff",
              borderColor: "primary.main",
            },
          }}
        >
          New Chat
        </Button>
      </Box>

      <Box sx={{ px: 2, py: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <HistoryIcon sx={{ fontSize: 18, color: "text.secondary" }} />
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontWeight: 600,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            {historyTitle}
          </Typography>
        </Box>
      </Box>

      <Box
        ref={listContainerRef}
        sx={{
          flex: 1,
          overflowY: "auto",

          /* Firefox */
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(0,0,0,0.3) transparent",

          /* Chrome, Edge, Safari */
          "&::-webkit-scrollbar": {
            width: 2,
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0,0,0,0.3)",
            borderRadius: 8,
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "rgba(0,0,0,0.5)",
          },
        }}
      >
        <SessionList
          sessions={sessions}
          selectedId={selectedSession?.session_id} // Fix: Pass ID, not object
          onSelect={handleSessionSelect}
          loading={loading}
        />

        {loadingMore && (
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="caption">Loading more…</Typography>
          </Box>
        )}

        {/* {!hasMore && !loading && sessions.length > 0 && (
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="caption">End of history</Typography>
          </Box>
        )} */}
      </Box>
    </Box>
  );
};

export default Sidebar;
