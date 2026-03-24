import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import ReviewChatPage from "./pages/ReviewChatPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SnackbarProvider maxSnack={3}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/yes-arc-mate" element={<Index />} />
          <Route path="/review-chat" element={<ReviewChatPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </SnackbarProvider>
  </QueryClientProvider>
);

export default App;
