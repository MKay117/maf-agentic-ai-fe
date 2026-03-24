import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import { useNavigate, useLocation } from "react-router-dom";
import Typography from "@mui/material/Typography";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isEAAgent = location.pathname.startsWith("/review-chat");
  const titleLeft = isEAAgent ? "Enterprise Architecture" : "YesArc";
  const titleRight = isEAAgent ? "Agent" : "Mate";

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        height: "64px",
        borderBottom: "1px solid",
        borderColor: "divider",
        backgroundColor: "white",
        justifyContent: "center",
      }}
    >
      <Toolbar sx={{ minHeight: "64px" }}>
        {/* Left */}
        <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Yes_Bank_Logo_in_2024.png/320px-Yes_Bank_Logo_in_2024.png"
            alt="Yes Bank"
            style={{ height: 48, objectFit: "contain", cursor: "pointer" }}
            onClick={() => navigate("/")}
          />
        </Box>

        {/* Center */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <img
            src="https://companieslogo.com/img/orig/YESBANK.NS-a31ff15a.png?t=1720244494"
            alt="YesArc"
            style={{ height: 32, width: 32, objectFit: "contain" }}
          />
          <Typography variant="h4" sx={{ color: "#002edc", fontWeight: 700 }}>
            {titleLeft}
          </Typography>
          <Typography variant="h4" sx={{ color: "#002edc", fontWeight: 700 }}>
            {titleRight}
          </Typography>
        </Box>

        {/* Right */}
        <Box sx={{ flex: 1 }} />
      </Toolbar>
    </AppBar>
  );
};

export default Header;
