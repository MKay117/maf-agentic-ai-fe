import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Divider,
  ListItemIcon,
} from "@mui/material";
import { Logout } from "@mui/icons-material";
import { getCurrentUser, logout } from "@/services/AuthService";
import { MoveLeft } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const user = getCurrentUser();
  const [anchorEl, setAnchorEl] = useState(null);

  const getInitials = (fullName) => {
    if (!fullName) return "U";
    const parts = fullName.trim().split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleClose();
    logout();
  };

  // Check if we are on the home page
  const isHomePage = location.pathname === "/home";

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        height: "64px",
        borderBottom: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
        color: "text.primary",
      }}
    >
      <Toolbar
        sx={{
          minHeight: "64px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {/* Left Section: Back Button + Branding */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Back Button (Only if not on Home) */}
          {!isHomePage && (
            <Tooltip title="Back to Home">
              <IconButton
                onClick={() => navigate("/home")}
                size="medium"
                sx={{ mr: 1 }}
              >
                <MoveLeft fontSize="medium" color="#000" />
              </IconButton>
            </Tooltip>
          )}

          <Box
            sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            onClick={() => navigate("/home")}
          >
            <img
              // src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Yes_Bank_Logo_in_2024.png/320px-Yes_Bank_Logo_in_2024.png"
              src="https://images.seeklogo.com/logo-png/55/1/yes-bank-logo-png_seeklogo-556505.png"
              alt="Yes Bank"
              style={{ height: 60, objectFit: "cover", width:100 }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            gap: 2,
            mr: 6,
            // border:'1px solid red'
          }}
        >
          <img
            src="https://companieslogo.com/img/orig/YESBANK.NS-a31ff15a.png?t=1720244494"
            alt="YesArc"
            style={{ height: 32, width: 32, objectFit: "contain" }}
          />
          <Typography
            variant="h4"
            sx={{ color: "primary.main", fontWeight: 700 }}
          >
            YesArcMate
          </Typography>
        </Box>

        {/* Account Menu */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title="Account Settings">
            <IconButton onClick={handleMenu} sx={{ p: 0, ml: 1 }}>
              <Avatar
                sx={{
                  bgcolor: "primary.main",
                  fontWeight: 400,
                  fontSize: "0.9rem",
                  width: 36,
                  height: 36,
                }}
              >
                {getInitials(user?.name)}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            onClick={handleClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: "visible",
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                mt: 1.5,
                "&:before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: "background.paper",
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {user?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.role}
              </Typography>
            </Box>
            <Divider />
            <MenuItem
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
