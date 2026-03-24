import { Paper, Typography, Box } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const FailureView = ({ summary, issues }) => (
  <Paper
    variant="outlined"
    sx={{
      p: 4,
      textAlign: "center",
      border: "1px solid",
      borderColor: "error.light",
      bgcolor: "#fffcfc",
      mt: 2,
    }}
  >
    <ErrorOutlineIcon sx={{ fontSize: 60, color: "error.main", mb: 2 }} />
    <Typography variant="h5" color="error" gutterBottom fontWeight={600}>
      Review Cannot Proceed
    </Typography>

    <Typography
      variant="body1"
      sx={{ mb: 3, maxWidth: "600px", mx: "auto", whiteSpace: "pre-line" }}
    >
      {summary || "An unknown error occurred during the analysis."}
    </Typography>

    {issues && issues.length > 0 && (
      <Box sx={{ maxWidth: "600px", mx: "auto", textAlign: "left", mt: 2 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Identified Issues:
        </Typography>
        <ul>
          {issues.map((issue, idx) => (
            <li key={idx}>
              <Typography variant="body2" color="text.secondary">
                {typeof issue === "string"
                  ? issue
                  : issue.message || JSON.stringify(issue)}
              </Typography>
            </li>
          ))}
        </ul>
      </Box>
    )}
  </Paper>
);

export default FailureView;
