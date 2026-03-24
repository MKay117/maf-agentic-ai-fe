import { Typography } from "@mui/material";

const MarkdownText = ({ text, variant = "body2", sx = {} }) => {
  if (!text) return null;

  const renderContent = () => {
    const parts = [];
    let remaining = text;
    let key = 0;
    const regex = /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*)/;

    while (remaining.length) {
      const match = remaining.match(regex);
      if (!match) {
        parts.push(<span key={key++}>{remaining}</span>);
        break;
      }
      const idx = match.index;
      if (idx > 0) {
        parts.push(<span key={key++}>{remaining.slice(0, idx)}</span>);
      }
      const token = match[0];
      const content = token.replace(/\*/g, "");
      if (token.startsWith("***")) {
        parts.push(
          <strong key={key++}>
            <em>{content}</em>
          </strong>
        );
      } else if (token.startsWith("**")) {
        parts.push(<strong key={key++}>{content}</strong>);
      } else {
        parts.push(<em key={key++}>{content}</em>);
      }
      remaining = remaining.slice(idx + token.length);
    }
    return parts;
  };

  return (
    <Typography variant={variant} sx={sx}>
      {renderContent()}
    </Typography>
  );
};

export default MarkdownText;
