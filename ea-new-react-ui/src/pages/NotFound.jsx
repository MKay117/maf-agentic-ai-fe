import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Box 
      sx={{ 
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "grey.100",
      }}
    >
      <Box textAlign="center">
        <Typography variant="h2" fontWeight="bold" gutterBottom>404</Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Oops! Page not found
        </Typography>
        <Link href="/" color="primary" underline="hover">
          Return to Home
        </Link>
      </Box>
    </Box>
  );
};

export default NotFound;
