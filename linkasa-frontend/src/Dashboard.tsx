"use client";

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { Book, FileText, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { API_URL } from "./constants";

interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    role: string;
}

function decodeJwt(token: string) {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map(
                    (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
                )
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Invalid token", e);
        return null;
    }
}

export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    navigate("/login");
                    return;
                }

                // Decode the token to get the user ID
                const payload = decodeJwt(token);
                if (!payload || !payload.sub) {
                    throw new Error("Invalid token payload");
                }
                const userId = payload.sub;

                // Fetch profile using the user ID
                const response = await fetch(`${API_URL}/accounts/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch user profile");
                }

                const data = await response.json();
                setUser(data);
            } catch (error) {
                console.error("Error fetching user profile:", error);
                toast("Error", {
                    description:
                        "Failed to load user profile. Please login again.",
                });
                localStorage.removeItem("token");
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        toast("Success", {
            description: "Logged out successfully",
        });
        navigate("/login");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center justify-center gap-4">
                    <img src="./LinKasa.svg" alt="" width="50" className="rounded-xl" />
                    <h1 className="text-3xl font-bold">
                        LinKasa Learning Platform
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="font-medium">{user?.name}</p>
                        <p className="text-sm text-muted-foreground">
                            {user?.role === "lecturer" && "Lecturer"}
                            {user?.role === "student" && "Student"}
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="w-full h-full flex flex-col items-center justify-center">
                    <CardHeader className="pb-2">
                        <CardTitle>Courses</CardTitle>
                        <CardDescription>Manage your courses</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col justify-center items-center gap-5">
                            <div className="flex items-center gap-2">
                                <Book className="h-5 w-5 text-primary" />
                                <span>View and manage courses</span>
                            </div>
                            <Button asChild>
                                <Link to="/courses">Go to Courses</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="w-full h-full flex flex-col items-center justify-center">
                    <CardHeader className="pb-2">
                        <CardTitle>Assignments</CardTitle>
                        <CardDescription>
                            Manage your assignments
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col justify-center items-center gap-5">
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                <span>View and manage assignments</span>
                            </div>
                            <Button asChild>
                                <Link to="/assignments">Go to Assignments</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle>Profile</CardTitle>
                        <CardDescription>
                            View your profile information
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center">
                        <div className="space-y-2">
                            <div className="flex flex-col items-center gap-2">
                                <User className="h-5 w-5 text-primary" />
                                <span className="font-medium">
                                    User Information
                                </span>
                            </div>
                            <div className="space-y-1">
                                <div className="flex">
                                    <span className="text-muted-foreground w-20">
                                        Name:
                                    </span>
                                    <span>{user?.name}</span>
                                </div>
                                <div className="flex">
                                    <span className="text-muted-foreground w-20">
                                        Email:
                                    </span>
                                    <span>{user?.email}</span>
                                </div>
                                <div className="flex">
                                    <span className="text-muted-foreground w-20">
                                        Role:
                                    </span>
                                    <span className="capitalize">
                                        {user?.role}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
