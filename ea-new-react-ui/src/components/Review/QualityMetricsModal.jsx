import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  IconButton,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { BarChart } from "@mui/x-charts/BarChart";

const QualityMetricsModal = ({ open, onClose, scores }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 0,
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          AI Quality Metrics
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        {scores ? (
          <Box
            sx={{
              width: "100%",
              height: 400,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <BarChart
              xAxis={[
                {
                  scaleType: "band",
                  data: [
                    "Accuracy",
                    "Bias (Inv)",
                    "Hallucination (Inv)",
                    "Confidence",
                  ],
                  categoryGapRatio: 0.6,
                },
              ]}
              series={[
                {
                  data: [
                    scores.accuracy,
                    scores.bias,
                    scores.hallucination,
                    scores.confidence,
                  ],
                  color: "#002edc",
                  label: "Score (1-10)",
                },
              ]}
              slotProps={{
                barLabel: {
                  style: { fill: "white", fontWeight: "bold", fontSize: 14 },
                },
              }}
              barLabel={(item) => item.value?.toString()}
              height={350}
              margin={{ top: 20, bottom: 30, left: 40, right: 10 }}
            />
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
