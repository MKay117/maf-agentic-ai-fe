import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";

import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CodeIcon from "@mui/icons-material/Code";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ArchiveIcon from "@mui/icons-material/Archive";

const getFileIcon = (type) => {
  if (!type) return <InsertDriveFileIcon fontSize="small" />;

  if (type.startsWith("image/")) return <ImageIcon fontSize="small" />;
  if (type.includes("json") || type.includes("text"))
    return <CodeIcon fontSize="small" />;
  if (type.includes("pdf")) return <PictureAsPdfIcon fontSize="small" />;
  if (type.includes("zip") || type.includes("archive"))
    return <ArchiveIcon fontSize="small" />;

  return <InsertDriveFileIcon fontSize="small" />;
};

const AttachmentPreview = ({ attachments, onRemove }) => {
  if (!attachments || attachments.length === 0) return null;

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 1,
        p: 2,
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      {attachments.map((attachment, idx) => {
        const fileName =
          attachment.name?.length > 20
            ? attachment.name.slice(0, 17) + "..."
            : attachment.name;

        // preview only if content is a data: URL (images or pdf data URLs)
        const isImage = attachment.type?.startsWith("image/");
        const contentIsDataUrl =
          typeof attachment.content === "string" &&
          attachment.content.startsWith("data:");
        const preview = isImage && contentIsDataUrl ? attachment.content : null;

        return (
          <Paper
            key={attachment.name + idx}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 1,
              borderRadius: 2,
              position: "relative",
            }}
            elevation={1}
          >
            {preview ? (
              <img
                src={preview}
                alt={attachment.name}
                style={{
                  width: 32,
                  height: 32,
                  objectFit: "cover",
                  borderRadius: 4,
                }}
              />
            ) : (
              getFileIcon(attachment.type)
            )}

            <Typography
              variant="body2"
              sx={{
                maxWidth: 220,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {fileName}
            </Typography>

            <IconButton size="small" onClick={() => onRemove(attachment.name)}>
              <CloseIcon fontSize="inherit" />
            </IconButton>
          </Paper>
        );
      })}
    </Box>
  );
};

export default AttachmentPreview;
