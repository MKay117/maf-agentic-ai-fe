import { Box, Card, CardActionArea, Typography } from "@mui/material";
import { Bolt, PrecisionManufacturing } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import chipset from "../assets/agents.jpg";

const Home = () => {
  const navigate = useNavigate();

  const cardSx = {
    width: { xs: 180, sm: 220, md: 260 }, // responsive width
    aspectRatio: "1 / 1", // keeps it a SQUARE
    borderRadius: 6,
    boxShadow: "0px 6px 18px rgba(0,0,0,0.2)",
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    backdropFilter: "blur(10px)",
    display: "flex",
    alignItems: "stretch",
    justifyContent: "center",
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    "&:hover": {
      boxShadow: "0px 10px 26px rgba(0,0,0,0.28)",
      transform: "translate(20px, -15px) scale(1.02)",
    },
    "&:active": {
      transform: "scale(0.97)",
      boxShadow: "0px 3px 10px rgba(0,0,0,0.2)",
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
        backgroundImage: `url(${chipset})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          width: "100%",
          backgroundColor: "#ebe7deff",
          padding: "16px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            justifySelf: "center",
          }}
        >
          <img
            src="https://companieslogo.com/img/orig/YESBANK.NS-a31ff15a.png?t=1720244494"
            alt="YesArc"
            style={{ height: 32, width: 32, objectFit: "contain" }}
          />
          <Typography variant="h4" sx={{ color: "#002edc", fontWeight: 700 }}>
            Yes Bank
          </Typography>
        </Box>
      </Box>

      {/* Cards */}
      <Box
        sx={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          justifyContent: "center",
          height: "85%",
          flexWrap: "wrap",
        }}
      >
        {/* Yes Arc Mate Card */}
        <Card sx={cardSx}>
          <CardActionArea
            sx={actionAreaSx}
            onClick={() => navigate("/yes-arc-mate")}
          >
            <PrecisionManufacturing sx={{ fontSize: 80, color: "#d71c23" }} />
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
            <Bolt sx={{ fontSize: 80, color: "#d71c23" }} />
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
