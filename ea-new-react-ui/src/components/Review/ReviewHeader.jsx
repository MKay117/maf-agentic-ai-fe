// import {
//   Box,
//   Paper,
//   Stack,
//   Typography,
//   LinearProgress,
//   IconButton,
//   Divider,
// } from "@mui/material";
// import {
//   FileSearch,
//   Upload,
//   ChartNoAxesCombined as BarChartIcon,
// } from "lucide-react";
// import MarkdownText from "../MarkdownText";
// import { cleanBullet, getSimilarityColor } from "@/utils/reviewUtils";

// const ReviewHeader = ({
//   reviewId,
//   reviewLoaded,
//   isViewOnly,
//   similarityScore,
//   hasAgentScores,
//   onOpenGraph,
//   parsedExecutive,
// }) => {
//   // 1. Loading / Empty State
//   if (!reviewLoaded) {
//     return (
//       <Stack spacing={2} alignItems="center" sx={{ mb: 3 }}>
//         <Box
//           sx={{
//             width: 64,
//             height: 64,
//             borderRadius: "50%",
//             bgcolor: "#eee",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//           }}
//         >
//           <FileSearch size={32} />
//         </Box>
//         <Typography variant="h4">Enterprise Architecture Review</Typography>
//         {!isViewOnly && (
//           <Stack direction="row" spacing={1}>
//             <Upload size={20} />
//             <Typography color="text.secondary">
//               Upload your architecture files for review
//             </Typography>
//           </Stack>
//         )}
//       </Stack>
//     );
//   }

//   // 2. Data Loaded State
//   return (
//     <Paper variant="outlined" sx={{ p: 2, width: "100%", mb: 3 }}>
//       {/* --- TOP ROW: Review ID (Left) | Graph Icon + Score (Right) --- */}
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           mb: 2, // Spacing between Header and Summary
//         }}
//       >
//         {/* Left: Review ID */}
//         <Typography variant="h6" fontWeight={600} color="primary">
//           Review ID: {reviewId}
//         </Typography>

//         {/* Right: Metrics Cluster */}
//         {similarityScore != null && (
//           <Stack direction="row" alignItems="center" spacing={2}>
//             {/* Graph Trigger Icon */}
//             {hasAgentScores && (
//               <IconButton
//                 onClick={onOpenGraph}
//                 size="medium"
//                 // sx={{
//                 //   color: "primary.main",
//                 //   bgcolor: "rgba(0, 46, 220, 0.05)",
//                 //   border: "1px solid",
//                 //   borderColor: "divider",
//                 //   "&:hover": { bgcolor: "rgba(0, 46, 220, 0.1)" },
//                 // }}
//               >
//                 <BarChartIcon size={20} />
//               </IconButton>
//             )}

//             {/* Similarity Score Bar */}
//             <Box sx={{ width: 180, textAlign: "right" }}>
//               <Stack
//                 direction="row"
//                 justifyContent="space-between"
//                 alignItems="center"
//               >
//                 <Typography variant="caption" color="text.secondary">
//                   Alignment with Standard Practices
//                 </Typography>
//                 <Typography variant="caption" fontWeight="bold">
//                   {similarityScore}%
//                 </Typography>
//               </Stack>
//               <LinearProgress
//                 variant="determinate"
//                 value={similarityScore}
//                 color={getSimilarityColor(similarityScore)}
//                 sx={{ height: 8, borderRadius: 4, mt: 0.5 }}
//               />
//             </Box>
//           </Stack>
//         )}
//       </Box>

//       <Divider sx={{ mb: 2 }} />

//       {/* --- BOTTOM ROW: Executive Summary (Full Width) --- */}
//       <Box sx={{ width: "100%" }}>
//         <Typography fontWeight={600} variant="subtitle1" gutterBottom>
//           Executive Summary
//         </Typography>
//         <Box component="ul" sx={{ pl: 2, m: 0 }}>
//           {parsedExecutive?.map((l, i) => (
//             <li key={i} style={{ marginBottom: "8px" }}>
//               <MarkdownText text={cleanBullet(l)} />
//             </li>
//           ))}
//         </Box>
//       </Box>
//     </Paper>
//   );
// };

// export default ReviewHeader;

import {
  Box,
  Paper,
  Stack,
  Typography,
  LinearProgress,
  IconButton,
  Divider,
} from "@mui/material";
import {
  FileSearch,
  Upload,
  ChartNoAxesCombined as BarChartIcon,
} from "lucide-react";
import MarkdownText from "../MarkdownText";
import { cleanBullet, getSimilarityColor } from "@/utils/reviewUtils";

const ReviewHeader = ({
  reviewId,
  reviewLoaded,
  isViewOnly,
  similarityScore,
  hasAgentScores,
  onOpenGraph,
  parsedExecutive,
}) => {
  // 1. Loading / Empty State
  if (!reviewLoaded) {
    return (
      <Stack spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            bgcolor: "#eee",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FileSearch size={32} />
        </Box>
        <Typography variant="h4">Enterprise Architecture Review</Typography>
        {!isViewOnly && (
          <Stack direction="row" spacing={1}>
            <Upload size={20} />
            <Typography color="text.secondary">
              Upload your architecture files for review
            </Typography>
          </Stack>
        )}
      </Stack>
    );
  }

  // 2. Data Loaded State
  return (
    <Paper variant="outlined" sx={{ p: 2, width: "100%", mb: 3 }}>
      {/* --- TOP ROW: Review ID (Left) | Score + Graph Icon (Right) --- */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        {/* Left: Review ID */}
        <Typography variant="h6" fontWeight={600} color="primary">
          Review ID: {reviewId}
        </Typography>

        {/* Right: Metrics Cluster */}
        {similarityScore != null && (
          <Stack direction="row" alignItems="center" spacing={3}>
            {/* 1. Similarity Score Bar (Now on the Left) */}
            <Box sx={{ width: 240, textAlign: "" }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="caption" color="text.secondary">
                  Alignment with Standard Practices
                </Typography>
                <Typography variant="caption" fontWeight="bold">
                  {similarityScore}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={similarityScore}
                color={getSimilarityColor(similarityScore)}
                sx={{ height: 8, borderRadius: 4, mt: 0.5 }}
              />
            </Box>

            {/* 2. Graph Trigger Icon (Now on the Right) */}
            {hasAgentScores && (
              <IconButton
                onClick={onOpenGraph}
                size="large"
                sx={{
                  color: "text.primary", // Black color
                  bgcolor: "transparent", // No background
                  "&:hover": {
                    bgcolor: "rgba(255, 182, 193, 0.3)", // Light pink shade
                  },
                  pr: 4,
                }}
              >
                <BarChartIcon size={24} />
              </IconButton>
            )}
          </Stack>
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* --- BOTTOM ROW: Executive Summary (Full Width) --- */}
      <Box sx={{ width: "100%" }}>
        <Typography fontWeight={600} variant="subtitle1" gutterBottom>
          Executive Summary
        </Typography>
        <Box component="ul" sx={{ pl: 2, m: 0 }}>
          {parsedExecutive?.map((l, i) => (
            <li key={i} style={{ marginBottom: "8px" }}>
              <MarkdownText text={cleanBullet(l)} />
            </li>
          ))}
        </Box>
      </Box>
    </Paper>
  );
};

export default ReviewHeader;
