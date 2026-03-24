import { useState, useEffect, useRef, useCallback } from "react";
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
        const resp =
          timeframe === "all"
            ? await getAllSessions(pageToFetch, PAGE_SIZE)
            : await getSessions(timeframe, pageToFetch, PAGE_SIZE);

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
            : items.length === PAGE_SIZE
        );
      } catch (e) {
        console.error("Failed to fetch sessions:", e);
        setHasMore(false);
      } finally {
        pageToFetch === 1 ? setLoading(false) : setLoadingMore(false);
      }
    },
    [timeframe]
  );

  // UPDATED: Re-run this effect whenever refreshTrigger changes
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    // Optional: Clear sessions immediately to show loading skeleton
    // setSessions([]);
    fetchPage(1);
  }, [fetchPage, refreshTrigger]);

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
    [onSessionSelect]
  );

  return (
    <Box
      sx={{
        width: 280,
        borderRight: "1px solid",
        borderColor: "divider",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={onNewChat}
          startIcon={<AddIcon />}
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
            Review History
          </Typography>
        </Box>
      </Box>

      <Box ref={listContainerRef} sx={{ flex: 1, overflowY: "auto" }}>
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
