import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Home from "./pages/Home";
import EAReview from "./pages/EAReview";
import PrivateRoute from "./components/PrivateRoute";
import StandardReview from "./pages/StandardReview";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<LoginPage />} />

        {/* Protected Dashboard */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/standard-review"
          element={
            <PrivateRoute>
              <StandardReview />
            </PrivateRoute>
          }
        />
        <Route
          path="/ea-rag-review"
          element={
            <PrivateRoute>
              <EAReview />
            </PrivateRoute>
          }
        />
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
