import { Box, Card, CardActionArea, Typography } from "@mui/material";
import { Bolt, PrecisionManufacturing } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const cardSx = {
    width: { xs: 180, sm: 220, md: 260 },
    aspectRatio: "1 / 1",
    borderRadius: 6,
    boxShadow: "0px 4px 20px rgba(0,0,0,0.05)",
    backgroundColor: "rgba(152, 153, 153, 0)",
    display: "flex",
    alignItems: "stretch",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    borderTop: "4px solid transparent",
    "& .MuiSvgIcon-root": {
      color: "#002edc", // Initial Blue
      transition: "color 0.3s ease",
    },
    "&:hover": {
      boxShadow: "0px 12px 30px rgba(0,0,0,0.12)",
      transform: "translate(20px, -15px) scale(1.02)",
      borderTop: "4px solid #d71c23", // Red border top
      "& .MuiSvgIcon-root": {
        color: "#d71c23", // Hover Red
      },
    },
    "&:active": {
      transform: "scale(0.98)",
    },
  };

  const actionAreaSx = {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    textAlign: "center",
    p: 2,
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        // Multi-tone Off-White Mesh Background (5 shades of near-white)
        background: `linear-gradient(135deg, 
          #fdfbfb 0%, 
          #f5f7fa 25%, 
          #ebedee 50%, 
          #f3f4f7 75%, 
          #fdfdfd 100%)`,
        backgroundSize: "400% 400%",
        animation: "subtleMove 20s ease infinite",
        "@keyframes subtleMove": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      }}
    >
      {/* Header - Royal Blue */}
      <Box
        sx={{
          width: "100%",
          backgroundColor: "#002edc",
          padding: "16px",
          display: "flex",
          justifyContent: "center",
          boxShadow: "0px 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <img
            src="https://companieslogo.com/img/orig/YESBANK.NS-a31ff15a.png?t=1720244494"
            alt="Yes Bank Logo"
            style={{
              height: 32,
              width: 32,
              objectFit: "contain",
              // Logo Filtered to Red
              filter:
                "invert(21%) sepia(91%) saturate(4525%) hue-rotate(351deg) brightness(87%) contrast(93%)",
            }}
          />
          <Typography variant="h4" sx={{ color: "#ffffff", fontWeight: 700 }}>
            Yes Bank
          </Typography>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box
        sx={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          justifyContent: "center",
          height: "calc(100% - 80px)",
          flexWrap: "wrap",
        }}
      >
        {/* Yes Arc Mate Card */}
        <Card sx={cardSx}>
          <CardActionArea
            sx={actionAreaSx}
            onClick={() => navigate("/yes-arc-mate")}
          >
            <PrecisionManufacturing sx={{ fontSize: 80 }} />
            <Typography
              variant="h5"
              sx={{ fontWeight: "600", color: "#002edc" }}
            >
              Yes ArcMate
            </Typography>
          </CardActionArea>
        </Card>

        {/* Quick EA Review Card */}
        <Card sx={cardSx}>
          <CardActionArea
            sx={actionAreaSx}
            onClick={() => navigate("/review-chat")}
          >
            <Bolt sx={{ fontSize: 80 }} />
            <Typography
              variant="h5"
              sx={{ fontWeight: "600", color: "#002edc" }}
            >
              Quick EA Review
            </Typography>
          </CardActionArea>
        </Card>
      </Box>
    </Box>
  );
};

export default Home;
