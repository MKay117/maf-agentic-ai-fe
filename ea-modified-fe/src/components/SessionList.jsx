import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import ButtonBase from "@mui/material/ButtonBase";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";

const SessionList = ({ sessions, selectedId, onSelect, loading }) => {
  if (loading) {
    return (
      <Box sx={{ px: 2, py: 1 }}>
        {[1, 2, 3].map((i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            height={48}
            sx={{ borderRadius: 2, mb: 1 }}
          />
        ))}
      </Box>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <Box sx={{ px: 2, py: 6, textAlign: "center" }}>
        <WorkHistoryIcon
          sx={{ fontSize: 32, color: "text.secondary", mb: 1 }}
        />
        <Typography variant="body2" color="text.secondary">
          No sessions found
        </Typography>
      </Box>
    );
  }

  const extractDateFromPath = (path) => {
    if (!path || typeof path !== "string") return null;
    const parts = path.split("/");
    // expecting ["Dec 2025", "12-12-2025", "session.json"]
    if (parts.length >= 2) {
      const candidate = parts[1];
      if (/^\d{2}-\d{2}-\d{4}$/.test(candidate)) {
        return candidate; // already DD-MM-YYYY
      }
    }
    return null;
  };

  const formatDateDisplay = (session) => {
    // prefer session.date
    if (
      session?.date &&
      typeof session.date === "string" &&
      /^\d{2}-\d{2}-\d{4}$/.test(session.date)
    ) {
      return session.date;
    }
    // fallback to path
    const fromPath = extractDateFromPath(session?.path);
    if (fromPath) return fromPath;

    // fallback to created_at ISO -> convert to DD-MM-YYYY
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
    return "—";
  };

  return (
    <Box
      sx={{
        px: 1,
        py: 1,
        // height: "100%",
      }}
    >
      {sessions.map((session, index) => {
        const isSelected =
          (typeof selectedId === "string" &&
            selectedId === session.session_id) ||
          (selectedId &&
            typeof selectedId === "object" &&
            selectedId.session_id === session.session_id);

        const title =
          session.session_id || session.title || `Session ${index + 1}`;
        const dateLabel = formatDateDisplay(session);

        return (
          <ButtonBase
            key={session.session_id ?? index}
            onClick={() => onSelect(session)}
            sx={{
              width: "100%",
              textAlign: "left",
              borderRadius: 2,
              px: 2,
              py: 1.5,
              mb: 1,
              display: "flex",
              alignItems: "center",
              backgroundColor: isSelected
                ? "action.hover"
                : "rgba(255, 255, 255, 0.6)",
              borderLeft: isSelected
                ? "3px solid rgba(36, 66, 216, 1)"
                : "3px solid transparent",
              borderColor: isSelected ? "primary.main" : "transparent",
              boxShadow: "0px 6px 18px rgba(0,0,0,0.2)",
            }}
          >
            <WorkHistoryIcon
              sx={{
                fontSize: 18,
                mr: 1.5,
                color: isSelected ? "primary.main" : "#4f050781",
              }}
            />

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                fontWeight={isSelected ? 600 : 500}
                sx={{
                  color: isSelected ? "primary.main" : "text.primary",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {title}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {dateLabel}
              </Typography>
            </Box>
          </ButtonBase>
        );
      })}
    </Box>
  );
};

export default SessionList;
