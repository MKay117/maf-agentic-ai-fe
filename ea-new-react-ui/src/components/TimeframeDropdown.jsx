import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { getTimeline } from "@/services/AgenticService";

const TimeframeDropdown = ({ value, onChange }) => {
  const [months, setMonths] = useState([]);

  useEffect(() => {
    const computeLast12MonthsLabels = () => {
      const res = [];
      const now = new Date();
      for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label =
          d.toLocaleString("default", { month: "short" }) +
          " " +
          d.getFullYear();
        res.push(label); // e.g. "Nov 2025"
      }
      return res;
    };

    const fetchTimeline = async () => {
      try {
        const data = await getTimeline();
        const timeline = data?.timeline || {};

        // Build set of available "Mon YYYY" labels from backend timeline
        const available = new Set();
        Object.entries(timeline).forEach(([year, monthsArr]) => {
          (monthsArr || []).forEach((m) => {
            if (m) available.add(`${m} ${year}`);
          });
        });

        // Limit to last 12 months only, intersect with available
        const last12 = computeLast12MonthsLabels();
        const filtered = last12.filter((label) => available.has(label));

        // If backend has nothing or intersection is empty, just show last12
        setMonths(filtered.length > 0 ? filtered : last12);
      } catch (err) {
        // fallback: purely last 12 months from current date
        const last12 = computeLast12MonthsLabels();
        setMonths(last12);
      }
    };

    fetchTimeline();
  }, []);

  const formatMonth = (val) => {
    if (val === "all") return "All Time";
    // Values are already like "Nov 2025"
    return val;
  };

  return (
    <Box sx={{ px: 2, py: 1 }}>
      <FormControl fullWidth size="small">
        <InputLabel id="timeframe-label">Timeframe</InputLabel>
        <Select
          labelId="timeframe-label"
          label="Timeframe"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          startAdornment={
            <CalendarTodayIcon sx={{ mr: 1, color: "text.secondary" }} />
          }
        >
          <MenuItem value="all">All Time</MenuItem>
          {months.map((month) => (
            <MenuItem key={month} value={month}>
              {formatMonth(month)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default TimeframeDropdown;
