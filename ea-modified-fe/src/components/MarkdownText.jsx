import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Link,
} from "@mui/material";

const MarkdownText = ({ text, variant = "body1", sx = {} }) => {
  if (!text) return null;

  return (
    <Box
      sx={{
        // Base styles for markdown elements
        "& h1": {
          color: "#002edc",
          mt: 2,
          mb: 1,
          fontWeight: 700,
          fontSize: "1.5rem",
        },
        "& h2": {
          color: "#002edc",
          mt: 2,
          mb: 1,
          fontWeight: 600,
          fontSize: "1.25rem",
          borderBottom: "1px solid #eee",
        },
        "& h3": {
          color: "#333",
          mt: 1.5,
          mb: 0.5,
          fontWeight: 600,
          fontSize: "1.1rem",
        },
        "& ul, & ol": { pl: 3, mb: 1 }, // Tighter lists for header compatibility
        "& li": { mb: 0.5 },
        "& strong": { fontWeight: 600 },
        "& blockquote": {
          borderLeft: "4px solid #002edc",
          pl: 2,
          py: 0.5,
          my: 1,
          bgcolor: "#f5f5f5",
        },
        "& code": {
          bgcolor: "#f0f0f0",
          px: 0.5,
          borderRadius: 1,
          fontFamily: "monospace",
          fontSize: "0.9em",
        },
        ...sx, // Allow overriding styles from parent (Critical for ReviewHeader)
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Use the passed 'variant' prop for standard text to match old behavior
          p: ({ node, ...props }) => (
            <Typography
              variant={variant}
              sx={{ mb: 1, lineHeight: 1.6 }}
              {...props}
            />
          ),
          a: ({ node, ...props }) => (
            <Link {...props} target="_blank" rel="noopener" />
          ),
          hr: ({ node, ...props }) => <Divider sx={{ my: 2 }} {...props} />,

          // Tables (Standard Review requirement)
          table: ({ node, ...props }) => (
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{ my: 2, boxShadow: "none" }}
            >
              <Table size="small" aria-label="markdown table" {...props} />
            </TableContainer>
          ),
          thead: ({ node, ...props }) => (
            <TableHead sx={{ bgcolor: "#f5f7fa" }} {...props} />
          ),
          tbody: ({ node, ...props }) => <TableBody {...props} />,
          tr: ({ node, ...props }) => <TableRow {...props} />,
          th: ({ node, ...props }) => (
            <TableCell
              sx={{
                fontWeight: "bold",
                color: "#002edc",
                borderBottom: "2px solid #e0e0e0",
              }}
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <TableCell sx={{ borderBottom: "1px solid #f0f0f0" }} {...props} />
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </Box>
  );
};

export default MarkdownText;
