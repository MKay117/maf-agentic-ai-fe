import Box from "@mui/material/Box";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
// import MainChatArea from "@/components/QuickReviewContainer/MainChatArea";

const ReviewChatPage = () => {
  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar />

        {/* <Box sx={{ flex: 1, overflow: "hidden" }}>
          <MainChatArea />
        </Box> */}
      </Box>
    </Box>
  );
};

export default ReviewChatPage;
