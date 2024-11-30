import { Navigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
  const accessToken = localStorage.getItem("access"); // Check if user is authenticated

  if (accessToken) {
    // If user is authenticated, redirect to dashboard or users page
    return <Navigate to="/users" replace />;
  }

  // If not authenticated, allow access to the public page
  return children;
};

export default PublicRoute;
