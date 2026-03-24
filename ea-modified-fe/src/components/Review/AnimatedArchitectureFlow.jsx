import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { MonitorCog, Cpu, CloudCog } from "lucide-react";

const ICON_SIZE = 64;

export default function AnimatedArchitectureFlow() {
  const theme = useTheme();

  // Color helper for readability in SVG
  const flowColor = theme.palette.secondary.main;

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        maxWidth: "900px",
        mx: "auto",
        height: 240,
        bgcolor: "background.paper",
        overflow: "hidden",
        p: 4,
      }}
    >
      {/* --- SVG LAYER (Background Animations) --- */}
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0, zIndex: 0 }}
        viewBox="0 0 800 250"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* -- PATHS -- */}

        {/* 1. Request: Monitor (150) -> CPU (400) [Curved Up] */}
        <path
          d="M 150 100 Q 275 50 400 100"
          fill="none"
          stroke={flowColor}
          strokeWidth="2"
          strokeDasharray="8 4"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="-24"
            dur="1s"
            repeatCount="indefinite"
          />
        </path>

        {/* 2. Request: CPU (400) -> Cloud (650) [Curved Up] */}
        <path
          d="M 400 100 Q 525 50 650 100"
          fill="none"
          stroke={flowColor}
          strokeWidth="2"
          strokeDasharray="8 4"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="-24"
            dur="1s"
            repeatCount="indefinite"
          />
        </path>

        {/* 3. Response: Cloud (650) -> CPU (400) [Curved Down] */}
        <path
          d="M 650 100 Q 525 150 400 100"
          fill="none"
          stroke={flowColor}
          strokeWidth="2"
          strokeDasharray="8 4"
          opacity="0.5" // Slightly dimmer for return path
        >
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="24" // Reverse direction
            dur="1s"
            repeatCount="indefinite"
          />
        </path>

        {/* 4. Response: CPU (400) -> Monitor (150) [Curved Down] */}
        <path
          d="M 400 100 Q 275 150 150 100"
          fill="none"
          stroke={flowColor}
          strokeWidth="2"
          strokeDasharray="8 4"
          opacity="0.5"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="24"
            dur="1s"
            repeatCount="indefinite"
          />
        </path>

        {/* -- MOVING PARTICLES (PULSE) -- */}

        {/* Pulse 1: Monitor -> CPU */}
        <circle r="5" fill={flowColor}>
          <animateMotion
            path="M 150 100 Q 275 50 400 100"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Pulse 2: CPU -> Cloud (Delayed) */}
        <circle r="5" fill={flowColor}>
          <animateMotion
            path="M 400 100 Q 525 50 650 100"
            dur="2s"
            begin="1s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Pulse 3: Cloud -> CPU (Return) */}
        <circle r="4" fill={flowColor} opacity="0.6">
          <animateMotion
            path="M 650 100 Q 525 150 400 100"
            dur="2s"
            begin="0s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Pulse 4: CPU -> Monitor (Return Delayed) */}
        <circle r="4" fill={flowColor} opacity="0.6">
          <animateMotion
            path="M 400 100 Q 275 150 150 100"
            dur="2s"
            begin="1s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>

      {/* --- HTML CONTENT LAYER --- */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          display: "flex",
          alignItems: "center", // Ensures all icons are on the same line
          justifyContent: "space-between", // Aligns with 150/400/650 SVG coordinates roughly
          px: { xs: 2, md: 8 }, // Padding matches SVG start/end points
        }}
      >
        {/* 1. MONITOR (YesArcMate) */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: 140,
          }}
        >
          <Box
            sx={{
              color: "primary.main",
              bgcolor: "background.paper",
              borderRadius: "50%",
              p: 1,
            }}
          >
            <MonitorCog size={ICON_SIZE} />
          </Box>
          <Typography
            variant="caption"
            color="text.primary"
            fontWeight={400}
            sx={{ mt: 1, textAlign: "center" }}
          >
            YesArcMate
          </Typography>
        </Box>

        {/* 2. CPU (MAF Orchestrator) */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: 140,
          }}
        >
          <Box
            sx={{
              color: "primary.main",
              bgcolor: "background.paper",
              borderRadius: "50%",
              p: 1,
            }}
          >
            <Cpu size={ICON_SIZE} />
          </Box>
          <Typography
            variant="caption"
            color="text.primary"
            fontWeight={400}
            sx={{ mt: 1, textAlign: "center" }}
          >
            MAF Orchestrator
          </Typography>
        </Box>

        {/* 3. CLOUD (Azure AI Search) */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: 140,
          }}
        >
          <Box
            sx={{
              color: "primary.main",
              bgcolor: "background.paper",
              borderRadius: "50%",
              p: 1,
            }}
          >
            <CloudCog size={ICON_SIZE} />
          </Box>
          <Typography
            variant="caption"
            color="text.primary"
            fontWeight={400}
            sx={{ mt: 1, textAlign: "center" }}
          >
            Azure AI Search
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
