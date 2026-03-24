import { useState, useEffect, useRef, useCallback } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import AddIcon from "@mui/icons-material/Add";
import HistoryIcon from "@mui/icons-material/History";

import SessionList from "./SessionList";

import { getAllSessions, getSessions } from "@/services/AgenticService";

const PAGE_SIZE = 10;

const Sidebar = ({ selectedSessionId, onSessionSelect, onNewChat }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination/infinite scroll state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // timeframe state kept simple: use "all" by default
  const [timeframe, setTimeframe] = useState("all");

  // scroll container ref
  const listContainerRef = useRef(null);

  // bring all fetched count to determine hasMore more robustly
  const totalCountRef = useRef(null); // store backend total if available

  // helper: ensure session has a `date` field (DD-MM-YYYY)
  const ensureSessionDate = (session) => {
    if (session?.date) {
      return session.date; // already DD-MM-YYYY per backend
    }
    // fallback: try to parse from session.path (e.g. "Dec 2025/12-12-2025/session.json")
    const p = session?.path;
    if (typeof p === "string") {
      const parts = p.split("/");
      // expect parts[1] == "DD-MM-YYYY"
      if (parts.length >= 2) {
        const candidate = parts[1];
        if (/^\d{2}-\d{2}-\d{4}$/.test(candidate)) {
          return candidate;
        }
      }
    }
    // last fallback: try created_at (ISO) -> convert to DD-MM-YYYY
    if (session?.created_at) {
      const d = new Date(session.created_at);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      }
    }
    return null;
  };

  // fetch page for 'all' (all-time) or for specific month if you later re-enable timeframe
  const fetchPage = useCallback(
    async (pageToFetch = 1) => {
      if (pageToFetch === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        let resp;
        if (timeframe === "all") {
          resp = await getAllSessions(pageToFetch, PAGE_SIZE);
        } else {
          // timeframe like "Nov 2025"
          resp = await getSessions(timeframe, pageToFetch, PAGE_SIZE);
        }

        const items = Array.isArray(resp?.items) ? resp.items : [];

        // normalize items with ensured date
        const normalized = items.map((it) => ({
          ...it,
          date: ensureSessionDate(it),
        }));

        // update total if present (only when page==1)
        if (resp?.total != null && pageToFetch === 1) {
          totalCountRef.current = resp.total;
        }

        if (pageToFetch === 1) {
          setSessions(normalized);
        } else {
          setSessions((prev) => [...prev, ...normalized]);
        }

        // determine hasMore
        if (resp?.total != null) {
          const accumulated = pageToFetch * PAGE_SIZE;
          setHasMore(accumulated < resp.total);
        } else {
          setHasMore(items.length === PAGE_SIZE);
        }
      } catch (err) {
        console.error("Failed to fetch sessions page:", err);
        setHasMore(false);
      } finally {
        if (pageToFetch === 1) setLoading(false);
        else setLoadingMore(false);
      }
    },
    [timeframe]
  );

  // initial load and whenever timeframe changes - reset pagination
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    totalCountRef.current = null;
    fetchPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe]);

  // infinite scroll listener
  useEffect(() => {
    const el = listContainerRef.current;
    if (!el) return;

    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        try {
          const { scrollTop, scrollHeight, clientHeight } = el;
          const atBottom = scrollTop + clientHeight >= scrollHeight - 60;
          if (atBottom && hasMore && !loadingMore && !loading) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchPage(nextPage);
          }
        } finally {
          ticking = false;
        }
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [fetchPage, hasMore, loadingMore, loading, page]);

  // wrapper for session selection: call external handler (no local storage)
  const handleSessionSelect = useCallback(
    (session) => {
      if (!session) return;

      const [month, year] = (session.month_year || "").split(" ");

      if (typeof onSessionSelect === "function") {
        onSessionSelect({
          session_id: session.session_id,
          date: session.date, // "12-12-2025"
          month: month, // "Dec"
          year: year, // "2025"
        });
      }
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
        boxSizing: "border-box",
      }}
    >
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
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

      <Box
        sx={{ flex: 1, overflowY: "auto", minHeight: 0 }}
        ref={listContainerRef}
      >
        <SessionList
          sessions={sessions}
          selectedId={selectedSessionId}
          onSelect={handleSessionSelect}
          loading={loading}
        />

        {loadingMore && (
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Loading more…
            </Typography>
          </Box>
        )}

        {!hasMore && !loading && sessions.length > 0 && (
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="caption" color="text.secondary">
              End of history
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Sidebar;
