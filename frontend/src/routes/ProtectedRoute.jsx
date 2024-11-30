import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const accessToken = localStorage.getItem("access"); // Check if user is authenticated

  if (!accessToken) {
    // If there's no access token, redirect to login page
    return <Navigate to="/" replace />;
  }

  // If the user is authenticated, render the child components
  return children;
};

export default ProtectedRoute;
