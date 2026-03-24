import { Box, Typography, Stack } from "@mui/material";
import { Upload, FileSearch } from "lucide-react";

const ChatEmptyState = ({ isViewOnly = false }) => {
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        px: 2,
      }}
    >
      <Stack spacing={2} alignItems="center">
        {/* <Box
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
          <FileSearch size={32} color="#053b8dff" />
        </Box> */}

        <Typography variant="h4" fontWeight={500}>
          Enterprise Architecture Review Agent
        </Typography>

        {!isViewOnly && (
          <Stack direction="row" spacing={1} alignItems="center">
            <Upload size={18} />
            <Typography color="text.secondary">
              Upload your architecture files (json/pdf/txt/docs) for discussion
              with agent
            </Typography>
          </Stack>
        )}
      </Stack>
    </Box>
  );
};

export default ChatEmptyState;
