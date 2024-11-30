import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import UsersList from "./components/Users/UsersList";
import LoginPage from "./pages/LoginPage";
import MainLayout from "./layouts/MainLayout";
import PatientsList from "./components/Patients/PatientsList";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import ModelsList from "./components/Models/Segmentation/ModelsList";
import CaptioningImageList from "./components/Models/ImageCaptioning/CaptioningImageList";
import PatientDetails from "./components/Patients/PatientDetails";
import UserDetails from "./components/Users/UserDetails";
import Annotate from "./components/Annotate/Annotate";
import Segmentation from "./components/Segmentation";
import ImageCaptioning from "./components/ImageCaptioning";
import AnnotateImage from "./components/Annotate/AnnotateImage";
import AnnotateList from "./components/Annotate/AnnotateList";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public route for login page */}
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />

        {/* Protected routes */}
        <Route element={<MainLayout />}>
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <UsersList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/:id"
            element={
              <ProtectedRoute>
                <UserDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients"
            element={
              <ProtectedRoute>
                <PatientsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients/:id"
            element={
              <ProtectedRoute>
                <PatientDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/models"
            element={
              <ProtectedRoute>
                <ModelsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/image"
            element={
              <ProtectedRoute>
                <CaptioningImageList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/annotate/:id"
            element={
              <ProtectedRoute>
                <Annotate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/annotate_image_s/:id"
            element={
              <ProtectedRoute>
                <AnnotateImage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/annotate_image"
            element={
              <ProtectedRoute>
                <AnnotateList />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/seg"
            element={
              <ProtectedRoute>
                <Segmentation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/image_cap"
            element={
              <ProtectedRoute>
                <ImageCaptioning />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={
            <ProtectedRoute>
              <div>Not Found</div>
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
