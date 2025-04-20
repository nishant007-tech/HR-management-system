// PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ component, path }) {
  const token = localStorage.getItem("token");

  if (token) {
    if (path === "/" || path === "/register") {
      return <Navigate to="/candidates" replace />;
    }
    return component;
  } else {
    if (path === "/" || path === "/register") {
      return component;
    }
    return <Navigate to="/" replace />;
  }
}

export default PrivateRoute;
