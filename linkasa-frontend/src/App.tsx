"use client";

import type React from "react";

import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router";
import { Toaster } from "sonner";
import Login from "./Login";
import Register from "./Register";
import CourseManagement from "./CourseManagement";
import AssignmentManagement from "./AssignmentManagement";
import "./App.css";
import Dashboard from "./Dashboard";

// Simple auth check function
const isAuthenticated = () => {
    return localStorage.getItem("token") !== null;
};

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};

function App() {
    return (
        <Router>
            <Toaster position="top-right" />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/courses"
                    element={
                        <ProtectedRoute>
                            <CourseManagement />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/assignments"
                    element={
                        <ProtectedRoute>
                            <AssignmentManagement />
                        </ProtectedRoute>
                    }
                />
                <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
