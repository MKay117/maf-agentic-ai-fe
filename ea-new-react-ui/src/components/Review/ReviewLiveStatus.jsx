import { useState, useEffect } from "react";
import { Paper, Box, Typography } from "@mui/material";
import { camelToNormal, getStatusColor } from "@/utils/reviewUtils";

const ReviewLiveStatus = ({ activeEvent }) => {
  const [dots, setDots] = useState(".");

  useEffect(() => {
    if (!activeEvent) return;
    const id = setInterval(
      () => setDots((d) => (d.length < 5 ? d + "." : ".")),
      400
    );
    return () => clearInterval(id);
  }, [activeEvent]);

  if (!activeEvent) {
    return (
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          Review Live Status
        </Typography>
        <Typography color="text.secondary">Waiting for updates…</Typography>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Typography variant="subtitle1" fontWeight={600}>
        Review Live Status
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="subtitle2">
          {camelToNormal(activeEvent.stage)} {dots}
        </Typography>
        <Typography
          sx={{
            color: getStatusColor(activeEvent.status),
            fontWeight: 600,
          }}
        >
          {camelToNormal(activeEvent.status)}
        </Typography>
      </Box>
    </Paper>
  );
};

export default ReviewLiveStatus;
