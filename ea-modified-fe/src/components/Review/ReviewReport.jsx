import { Paper, Typography, Box } from "@mui/material";
import MarkdownText from "../MarkdownText";
import { cleanBullet } from "@/utils/reviewUtils";

const SectionBox = ({ title, items, sx = {} }) => (
  <Paper variant="outlined" sx={{ p: 2, minHeight: 150, ...sx }}>
    <Typography fontWeight={600} variant="h6" gutterBottom>
      {title}
    </Typography>
    <Box component="ul" sx={{ pl: 2, m: 0 }}>
      {items?.map((l, i) => (
        <li key={i}>
          <MarkdownText text={cleanBullet(l)} />
        </li>
      ))}
    </Box>
  </Paper>
);

const ReviewReport = ({ parsedData }) => {
  if (!parsedData) return null;

  return (
    <>
      {/* FIX: Layout changed to 'display: flex' with 'gap: 2'.
         Children use 'flex' ratio (65 vs 35) to split REMAINING space 
         after the gap, ensuring exactly 100% total width with no scroll.
      */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          width: "100%",
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        <SectionBox
          title="Strengths"
          items={parsedData.strengths}
          sx={{ flex: { xs: "1 1 auto", md: 65 } }} // Takes 65 parts of space
        />
        <SectionBox
          title="Best Practices"
          items={parsedData.bestPractice}
          sx={{ flex: { xs: "1 1 auto", md: 35 } }} // Takes 35 parts of space
        />
      </Box>

      <Box sx={{ mt: 2 }}>
        <SectionBox
          title="Recommendations"
          items={parsedData.recommendations}
          sx={{ width: "100%" }}
        />
      </Box>
    </>
  );
};

export default ReviewReport;
