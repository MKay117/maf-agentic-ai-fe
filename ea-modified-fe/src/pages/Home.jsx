// import { useNavigate } from "react-router-dom";
// import {
//   Box,
//   Container,
//   Typography,
//   Grid,
//   Card,
//   CardContent,
//   CardActionArea,
//   Stack,
//   Button,
// } from "@mui/material";
// import { Psychology, Hub } from "@mui/icons-material";
// import Header from "@/components/Header";
// import { ScanSearch, ScrollText, Shield, Target, Zap } from "lucide-react";

// /* ---------- Configuration ---------- */
// const COLORS = {
//   primaryBlue: "#0014F5",
//   iconBlack: "#1a1a1a",
//   bgInitial: "#f4f6f8",
//   borderDefault: "#e0e0e0",
// };

// /* ---------- Card Styles ---------- */
// const getCardStyles = () => ({
//   width: 340,
//   borderRadius: 8,
//   backgroundColor: "#fff",
//   border: `1px solid ${COLORS.borderDefault}`, // ✅ sane thin border
//   borderTop: "4px solid transparent",
//   transition: "all 0.25s ease",
//   boxShadow: "0px 6px 20px rgba(0,0,0,0.06)",

//   "& .card-icon": {
//     color: COLORS.primaryBlue,
//     transition: "all 0.3s ease",
//   },

//   "& .card-icon-box": {
//     bgcolor: COLORS.bgInitial,
//     borderRadius: "50%",
//     width: 72,
//     height: 72,
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     margin: "0 auto 16px auto", // ✅ center icon
//     transition: "all 0.3s ease",
//   },

//   "&:hover": {
//     transform: "translateY(-6px)",
//     borderTop: `4px solid ${COLORS.primaryBlue}`, // ✅ only top blue
//     borderLeft: `1px solid ${COLORS.primaryBlue}`,
//     borderRight: `1px solid ${COLORS.primaryBlue}`,
//     borderBottom: `1px solid ${COLORS.primaryBlue}`,
//     boxShadow: "0px 14px 32px rgba(0,0,0,0.12)",

//     "& .card-icon": {
//       color: "#fff",
//     },
//     "& .card-icon-box": {
//       bgcolor: COLORS.primaryBlue,
//     },
//   },
// });

// /* ---------- Reusable Card ---------- */
// const ProtocolCard = ({ title, description, icon: Icon, features, path }) => {
//   const navigate = useNavigate();

//   return (
//     <Card sx={getCardStyles()}>
//       <CardActionArea
//         onClick={() => navigate(path)}
//         sx={{ p: 3, textAlign: "center" }}
//       >
//         <CardContent sx={{ p: 0 }}>
//           {/* Icon */}
//           <Box className="card-icon-box">
//             <Icon className="card-icon" sx={{ fontSize: 36 }} />
//           </Box>

//           {/* Title */}
//           <Typography variant="h6" fontWeight={600} gutterBottom>
//             {title}
//           </Typography>

//           {/* Description */}
//           <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
//             {description}
//           </Typography>

//           {/* Features */}
//           <Stack spacing={1.5} sx={{ mb: 3, px: 1 }}>
//             {features.map((f, i) => (
//               <Stack
//                 key={i}
//                 direction="row"
//                 spacing={1.5}
//                 alignItems="flex-start" // ✅ left aligned
//               >
//                 <Box
//                   sx={{
//                     color: "#F52900",
//                     mt: "2px", // aligns icon with text baseline
//                   }}
//                 >
//                   {f.icon}
//                 </Box>
//                 <Typography variant="body2">
//                   <strong>{f.label}:</strong> {f.value}
//                 </Typography>
//               </Stack>
//             ))}
//           </Stack>

//           {/* Button
//           <Button
//             fullWidth
//             variant="outlined"
//             sx={{
//               py: 1.2,
//               fontWeight: 600,
//               color: COLORS.iconBlack, // ✅ black text
//               borderColor: COLORS.iconBlack,
//               backgroundColor: "#fff",

//               "&:hover": {
//                 backgroundColor: COLORS.primaryBlue, // stays white
//                 color: "#fff", // ✅ blue text
//               },
//             }}
//           >
//             INITIALIZE
//           </Button> */}
//         </CardContent>
//       </CardActionArea>
//     </Card>
//   );
// };

// /* ---------- Home Page ---------- */
// const Home = () => {
//   return (
//     <Box sx={{ minHeight: "100vh", bgcolor: "#f4f6f8" }}>
//       <Header />

//       <Container maxWidth="lg" sx={{ py: 6 }}>
//         {/* Header */}
//         <Box textAlign="center" mb={5}>
//           <Typography
//             variant="h4"
//             fontWeight={700}
//             sx={{
//               color: "#323f4b",
//               mb: 1,
//             }}
//           >
//             Review Protocol
//           </Typography>

//           <Typography color="text.secondary">
//             Choose the analysis depth for your architecture review
//           </Typography>
//         </Box>

//         {/* Cards */}
//         <Grid container spacing={4} justifyContent="center">
//           <Grid item>
//             <ProtocolCard
//               title="Standard Review"
//               description="Rapid assessment using base LLM (GPT-4.1)"
//               icon={Hub}
//               path="/standard-review"
//               features={[
//                 {
//                   label: "Speed",
//                   value: "Instant",
//                   icon: <Zap fontSize="small" />,
//                 },
//                 {
//                   label: "Scope",
//                   value: "Industry Standards",
//                   icon: <ScanSearch fontSize="small" />,
//                 },
//                 {
//                   label: "Security",
//                   value: "Basic Checks",
//                   icon: <Shield fontSize="small" />,
//                 },
//               ]}
//             />
//           </Grid>

//           <Grid item>
//             <ProtocolCard
//               title="Enterprise RAG"
//               description="Deep analysis using RAG & bank policies"
//               icon={Psychology}
//               path="/ea-rag-review"
//               features={[
//                 {
//                   label: "Context",
//                   value: "Vector DB",
//                   icon: <ScrollText fontSize="small" />,
//                 },
//                 {
//                   label: "Scope",
//                   value: "Bank Policy Specific",
//                   icon: <ScanSearch fontSize="small" />,
//                 },
//                 {
//                   label: "Accuracy",
//                   value: "High Precision",
//                   icon: <Target fontSize="small" />,
//                 },
//               ]}
//             />
//           </Grid>
//         </Grid>
//       </Container>
//     </Box>
//   );
// };

// export default Home;

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { CloudUpload, History, FileUp, Cpu, Eye } from "lucide-react";
import Header from "../components/Header";
import { getAllSessions } from "../services/AgenticService";

const Home = () => {
  const navigate = useNavigate();
  const [appName, setAppName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await getAllSessions(1, 20);
        // Map the items to include a unique 'id' required by DataGrid
        const rowsWithId = (response?.items || []).map((item, index) => ({
          ...item,
          id: item.session_id || index, // DataGrid requires a unique 'id' property
        }));
        setHistory(rowsWithId);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, []);

  const fileInputRef = useRef(null);
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length > 0) {
      setFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleSubmit = () => {
    if (!appName.trim() || !file)
      return alert("Application Name and an Artifact are required.");
    setIsSubmitting(true);
    navigate("/ea-rag-review", {
      state: {
        triggerNewReview: true,
        payload: { title: appName, description, file },
      },
    });
  };

  // Risk Badge Logic
  const getRiskBadge = (size) => {
    if (size == null) return <Chip label="UNKNOWN" size="small" />;
    if (size > 95000)
      return (
        <Chip
          label="CRITICAL"
          size="small"
          sx={{
            color: "#D71920",
            bgcolor: "#fde8e8",
            fontWeight: 600,
            border: "1px solid #D71920",
          }}
        />
      );
    if (size < 95000 && size > 70000)
      return (
        <Chip
          label="MEDIUM"
          size="small"
          sx={{
            color: "#d97706",
            bgcolor: "#fef3c7",
            fontWeight: 600,
            border: "1px solid #f59e0b",
          }}
        />
      );
    return (
      <Chip
        label="PASS"
        size="small"
        sx={{
          color: "#059669",
          bgcolor: "#d1fae5",
          fontWeight: 600,
          border: "1px solid #10b981",
        }}
      />
    );
  };

  // --- DataGrid Column Definitions ---
  const columns = [
    {
      field: "title",
      headerName: "REVIEW",
      flex: 1.5,
      minWidth: 200,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const displayTitle =
          params.row.timestamp ||
          params.row.session_id.replace("session_", "").replace(/_/g, " ");
        return (
          // Added alignItems: 'center' here so the stacked text centers inside the centered column
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-start",
              height: "100%",
            }}
          >
            <Typography
              variant="subtitle2"
              fontWeight={700}
              color="#0f172a"
              noWrap
              title={displayTitle}
            >
              {displayTitle}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ lineHeight: 1 }}
            >
              {params.row.date}
            </Typography>
          </Box>
        );
      },
    },
    // {
    //   field: "date",
    //   headerName: "DATE",
    //   flex: 1,
    //   minWidth: 100,
    //   align: "center",
    //   headerAlign: "center",
    //   valueGetter: (value, row) =>
    //     new Date(row.last_modified).toLocaleDateString(),
    // },
    {
      field: "time",
      headerName: "TIME",
      flex: 1,
      minWidth: 100,
      align: "center",
      headerAlign: "center",
      valueGetter: (value, row) =>
        new Date(row.last_modified).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
    {
      field: "size",
      headerName: "SIZE",
      flex: 1,
      minWidth: 100,
      align: "center",
      headerAlign: "center",
      // Convert bytes to KB and format to 1 decimal place
      valueGetter: (value, row) =>
        row.size != null ? `${(row.size / 1024).toFixed(1)} KB` : "0 KB",
    },
    {
      field: "risk",
      headerName: "RISK",
      flex: 1,
      minWidth: 110,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => getRiskBadge(params.row.size),
    },
    {
      field: "actions",
      headerName: "ACTION",
      flex: 0.5,
      minWidth: 80,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Tooltip title="View Review">
          <IconButton
            onClick={() =>
              navigate(`/ea-rag-review?id=${params.row.session_id}`)
            }
            sx={{ color: "#002edc" }}
          >
            <Eye size={20} />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#f8fafc",
      }}
    >
      <Header />
      <Box sx={{ display: "flex", flex: 1, p: 4, gap: 4, overflow: "hidden" }}>
        {/* LEFT PANEL */}
        <Paper
          elevation={0}
          sx={{
            flex: { xs: 1, lg: 0.4 },
            p: 4,
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 1.5 }}>
            <CloudUpload color="#002edc" size={26} />
            <Typography variant="h5" fontWeight={700} color="#0f172a">
              New Analysis
            </Typography>
          </Box>
          <Box
            sx={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}
          >
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                fontWeight={600}
                mb={1}
              >
                Review Session Name
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter review name..."
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                sx={{ bgcolor: "#f8fafc" }}
              />
            </Box>
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                fontWeight={600}
                mb={1}
              >
                Description / Context
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Brief description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                sx={{ bgcolor: "#f8fafc" }}
              />
            </Box>
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                fontWeight={600}
                mb={1}
              >
                Artifacts
              </Typography>
              <Box
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  border: `2px dashed ${isDragging ? "#002edc" : "#cbd5e1"}`,
                  borderRadius: 2,
                  bgcolor: isDragging ? "#eff6ff" : "#ffffff",
                  p: 4,
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={(e) => setFile(e.target.files?.[0])}
                  accept=".png,.jpg,.pdf,.json,.zip,.xlsx"
                />
                {file ? (
                  <Box>
                    <FileUp
                      size={32}
                      color="#002edc"
                      style={{ margin: "0 auto 8px" }}
                    />
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      color="#002edc"
                    >
                      {file.name}
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <FileUp
                      size={32}
                      color="#94a3b8"
                      style={{ margin: "0 auto 8px" }}
                    />
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      color="#0f172a"
                    >
                      Drag & Drop files here
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={isSubmitting || !appName || !file}
            sx={{
              mt: 4,
              py: 1.5,
              fontWeight: 700,
              bgcolor: "#7c3aed",
              "&:hover": { bgcolor: "#6d28d9" },
            }}
            startIcon={<Cpu size={20} />}
          >
            Run Architecture Review
          </Button>
        </Paper>

        {/* RIGHT PANEL: History List with DataGrid */}
        <Paper
          elevation={0}
          sx={{
            flex: { xs: 1, lg: 0.6 },
            p: 4,
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 1.5 }}>
            <History color="#0891b2" size={26} />
            <Typography variant="h5" fontWeight={700} color="#0f172a">
              Review History
            </Typography>
          </Box>

          <Box sx={{ flex: 1, width: "100%", minHeight: 400 }}>
            {loadingHistory ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <CircularProgress />
              </Box>
            ) : (
              <DataGrid
                rows={history}
                columns={columns}
                initialState={{
                  pagination: {
                    paginationModel: {
                      pageSize: 10,
                    },
                  },
                }}
                pageSizeOptions={[5, 10, 20]}
                disableRowSelectionOnClick
                sx={{
                  border: 0,
                  "& .MuiDataGrid-columnHeaders": {
                    bgcolor: "#f8fafc",
                    color: "#64748b",
                    fontWeight: 700,
                  },
                  "& .MuiDataGrid-row:hover": {
                    bgcolor: "#f1f5f9",
                  },
                  "& .MuiDataGrid-cell:focus": {
                    outline: "none",
                  },
                }}
              />
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Home;
