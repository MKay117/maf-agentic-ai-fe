import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  IconButton,
  Box,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import BalanceIcon from "@mui/icons-material/Balance";
import PsychologyIcon from "@mui/icons-material/Psychology";
import VerifiedIcon from "@mui/icons-material/Verified";
import { BarChart } from "@mui/x-charts/BarChart";

const QualityMetricsModal = ({ open, onClose, scores }) => {
  const metricsConfig = scores
    ? [
        {
          id: "acc",
          label: "Accuracy",
          value: scores.accuracy,
          icon: <GpsFixedIcon fontSize="medium" />,
          description:
            "Accuracy Score - AI response compared to the source material and prompt (higher is better)",
        },
        {
          id: "bias",
          label: "Bias",
          value: scores.bias,
          icon: <BalanceIcon fontSize="medium" />,
          description:
            "Bias Score - Bias in the generated response (lower is better)",
        },
        {
          id: "hall",
          label: "Hallucination",
          value: scores.hallucination,
          icon: <PsychologyIcon fontSize="medium" />,
          description:
            "Hallucination Score - Fabricated facts or hallucinations in the response (lower is better)",
        },
        {
          id: "conf",
          label: "Confidence",
          value: scores.confidence,
          icon: <VerifiedIcon fontSize="medium" />,
          description:
            "Confidence Score - AI model's internal confidence score for its response",
        },
      ]
    : [];

  const chartMargin = { top: 10, bottom: 40, left: -10, right: -10 };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        AI Response – Quality Metrics
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {scores ? (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* BAR CHART */}
            <BarChart
              xAxis={[
                {
                  scaleType: "band",
                  data: metricsConfig.map((m) => m.label),
                  categoryGapRatio: 0.7,
                },
              ]}
              series={[
                {
                  data: metricsConfig.map((m) => m.value),
                  color: "#002edc",
                },
              ]}
              tooltip={{
                trigger: "item",
                valueFormatter: (value, context) => {
                  const metric = metricsConfig[context.dataIndex];
                  return metric
                    ? `${metric.label}: ${value}/10`
                    : `${value}/10`;
                },
              }}
              slotProps={{
                barLabel: {
                  style: {
                    fill: "white",
                    fontWeight: "bold",
                    fontSize: 12,
                  },
                },
              }}
              barLabel={(item) => item.value?.toString()}
              height={350}
              width={550}
              margin={chartMargin}
            />

            {/* ICON TOOLTIP ROW */}
            <Box
              sx={{
                width: "100%",
                mt: -2,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              {metricsConfig.map((metric) => (
                <Box
                  key={metric.id}
                  sx={{
                    flex: 1,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Tooltip title={metric.description} arrow placement="top">
                    <IconButton size="small" color="secondary">
                      {metric.icon}
                    </IconButton>
                  </Tooltip>
                </Box>
              ))}
            </Box>
          </Box>
        ) : (
          <Typography align="center" color="text.secondary">
            No scoring data available.
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QualityMetricsModal;
