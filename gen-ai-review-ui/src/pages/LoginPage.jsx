import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  InputAdornment,
  IconButton,
  Alert,
  Checkbox,
  FormControlLabel,
  Tooltip,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  LockOutlined,
  PersonOutline,
  InfoOutlined,
} from "@mui/icons-material";
import { login, getCurrentUser } from "../services/AuthService";

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [credentials, setCredentials] = useState({ adid: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getCurrentUser()) navigate("/home", { replace: true });
  }, [navigate]);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!credentials.adid || !credentials.password) return;

    setLoading(true);
    try {
      await login(credentials.adid, credentials.password, rememberMe);
      navigate("/home", { replace: true });
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    credentials.adid.trim().length > 0 &&
    credentials.password.trim().length > 0;

  return (
    <Box sx={{ height: "100vh", display: "flex", overflow: "hidden" }}>
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "#ffffff",
          p: 4,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 480,
            p: { xs: 2, sm: 0 },
            bgcolor: "transparent",
          }}
        >
          <Box textAlign={"center"} mb={4}>
            <img
              src="[https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Yes_Bank_Logo_in_2024.png/320px-Yes_Bank_Logo_in_2024.png](https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Yes_Bank_Logo_in_2024.png/320px-Yes_Bank_Logo_in_2024.png)"
              alt="Yes Bank Logo"
              style={{ width: 150 }}
            />
          </Box>

          <form onSubmit={handleLogin}>
            <Stack spacing={3}>
              {error && <Alert severity="error">{error}</Alert>}

              <Box>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  Employee ID / ADID
                </Typography>
                <TextField
                  fullWidth
                  name="adid"
                  placeholder="e.g. MKC2100014"
                  variant="outlined"
                  value={credentials.adid}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutline color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Box>
                <Box
                  sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}
                >
                  <Typography variant="subtitle2" fontWeight={600}>
                    Password
                  </Typography>
                  <Tooltip
                    title="One login can be used upto 8hrs"
                    arrow
                    placement="right"
                  >
                    <InfoOutlined
                      fontSize="small"
                      color="disabled"
                      sx={{ cursor: "help" }}
                    />
                  </Tooltip>
                  <Box sx={{ flexGrow: 1 }} />
                  <Typography
                    variant="caption"
                    sx={{
                      cursor: "pointer",
                      fontWeight: 600,
                      color: "#002edc",
                    }}
                  >
                    Forgot Password?
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  name="password"
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"}
                  variant="outlined"
                  value={credentials.password}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <FormControlLabel
                control={
                  <Checkbox
                    color="primary"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                }
                label={
                  <Typography variant="body2">
                    Remember me for 24 hours
                  </Typography>
                }
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading || !isFormValid}
                sx={{
                  py: 1.8,
                  fontSize: "1rem",
                  fontWeight: 600,
                  bgcolor: "#002edc",
                  "&:hover": { bgcolor: "#001a99" },
                }}
              >
                {loading ? "Authenticating..." : "Sign In"}
              </Button>
            </Stack>
          </form>
        </Paper>
      </Box>

      <Box
        sx={{
          flex: { xs: 0, md: 1.2 },
          bgcolor: "#F2F9FF",
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 6,
          color: "#002edc",
        }}
      >
        <Box sx={{ mb: 8 }}>
          <Box
            display={"flex"}
            alignItems={"center"}
            justifyContent={"flex-start"}
          >
            <img
              src="[https://companieslogo.com/img/orig/YESBANK.NS-a31ff15a.png?t=1720244494](https://companieslogo.com/img/orig/YESBANK.NS-a31ff15a.png?t=1720244494)"
              alt="YesArc"
              style={{ margin: 2, height: 50, width: 50, objectFit: "contain" }}
            />
            <Typography variant="h2" fontWeight={800} sx={{ m: 2 }}>
              YesArcMate
            </Typography>
          </Box>
          <Typography
            variant="h6"
            sx={{
              opacity: 0.9,
              fontWeight: 400,
              maxWidth: 500,
              lineHeight: 1.6,
            }}
          >
            Automated Architecture Review & Compliance Assistant
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ opacity: 0.6 }}>
          © 2026 Yes Bank Limited. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginPage;
