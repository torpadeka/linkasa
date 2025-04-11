"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Eye, Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { API_URL } from "./constants";
import { useNavigate } from "react-router";

// Course type definition based on your TypeORM entity
interface Course {
    id: number;
    name: string;
    description: string;
    isActive: boolean;
    category: string;
}

// Initial empty course for the create form
const emptyCourse: Course = {
    id: 0,
    name: "",
    description: "",
    isActive: true,
    category: "",
};

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

interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    role: string;
}

export default function CourseManagement() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Dialog states
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [currentCourse, setCurrentCourse] = useState<Course>(emptyCourse);

    // Fetch all courses on component mount
    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/courses`);
            if (!response.ok) {
                throw new Error("Failed to fetch courses");
            }
            const data = await response.json();
            setCourses(data);
        } catch (err) {
            setError("Error loading courses. Please try again later.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/courses`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(currentCourse),
            });

            if (!response.ok) {
                throw new Error("Failed to create course");
            }

            await fetchCourses();
            setCreateDialogOpen(false);
            setCurrentCourse(emptyCourse);
            toast("Success", {
                description: "Course created successfully",
            });
        } catch (err) {
            console.error(err);
            toast("Error", {
                description: "Failed to create course. Please try again.",
            });
        }
    };

    const handleUpdateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(
                `${API_URL}/courses/${currentCourse.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(currentCourse),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update course");
            }

            await fetchCourses();
            setEditDialogOpen(false);
            toast("Success", {
                description: "Course updated successfully",
            });
        } catch (err) {
            console.error(err);
            toast("Error", {
                description: "Failed to update course. Please try again.",
            });
        }
    };

    const handleDeleteCourse = async () => {
        try {
            const response = await fetch(
                `${API_URL}/courses/${currentCourse.id}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                throw new Error("Failed to delete course");
            }

            await fetchCourses();
            setDeleteDialogOpen(false);
            toast("Success", {
                description: "Course deleted successfully",
            });
        } catch (err) {
            console.error(err);
            toast("Error", {
                description: "Failed to delete course. Please try again.",
            });
        }
    };

    const openCreateDialog = () => {
        setCurrentCourse(emptyCourse);
        setCreateDialogOpen(true);
    };

    const openEditDialog = (course: Course) => {
        setCurrentCourse(course);
        setEditDialogOpen(true);
    };

    const openDeleteDialog = (course: Course) => {
        setCurrentCourse(course);
        setDeleteDialogOpen(true);
    };

    const openViewDialog = (course: Course) => {
        setCurrentCourse(course);
        setViewDialogOpen(true);
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setCurrentCourse((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCheckboxChange = (checked: boolean) => {
        setCurrentCourse((prev) => ({
            ...prev,
            isActive: checked,
        }));
    };

    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);

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
        <>
            <div className="container mx-auto py-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center justify-center gap-4">
                        <img
                            src="./LinKasa.svg"
                            alt=""
                            width="50"
                            className="rounded-xl"
                        />
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
            </div>

            <div className="container mx-auto">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">
                                Course Management
                            </CardTitle>
                            <CardDescription>
                                Create, view, edit, and delete courses in the
                                LinKasa learning platform.
                            </CardDescription>
                        </div>
                        <Button onClick={openCreateDialog}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Course
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : error ? (
                            <div className="text-center text-red-500 p-4">
                                {error}
                            </div>
                        ) : courses.length === 0 ? (
                            <div className="text-center p-8">
                                <p className="text-muted-foreground mb-4">
                                    No courses found
                                </p>
                                <Button onClick={openCreateDialog}>
                                    Create your first course
                                </Button>
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {courses.map((course) => (
                                            <TableRow key={course.id}>
                                                <TableCell className="font-medium">
                                                    {course.name}
                                                </TableCell>
                                                <TableCell>
                                                    {course.category}
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                            course.isActive
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-red-100 text-red-800"
                                                        }`}
                                                    >
                                                        {course.isActive
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() =>
                                                                openViewDialog(
                                                                    course
                                                                )
                                                            }
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() =>
                                                                openEditDialog(
                                                                    course
                                                                )
                                                            }
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="text-red-500"
                                                            onClick={() =>
                                                                openDeleteDialog(
                                                                    course
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Create Course Dialog */}
                <Dialog
                    open={createDialogOpen}
                    onOpenChange={setCreateDialogOpen}
                >
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Create New Course</DialogTitle>
                            <DialogDescription>
                                Add a new course to the LinKasa learning
                                platform.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateCourse}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="name"
                                        className="text-right"
                                    >
                                        Name
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={currentCourse.name}
                                        onChange={handleInputChange}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="category"
                                        className="text-right"
                                    >
                                        Category
                                    </Label>
                                    <Input
                                        id="category"
                                        name="category"
                                        value={currentCourse.category}
                                        onChange={handleInputChange}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-start gap-4">
                                    <Label
                                        htmlFor="description"
                                        className="text-right pt-2"
                                    >
                                        Description
                                    </Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={currentCourse.description}
                                        onChange={handleInputChange}
                                        className="col-span-3"
                                        rows={4}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="isActive"
                                        className="text-right"
                                    >
                                        Status
                                    </Label>
                                    <div className="flex items-center space-x-2 col-span-3">
                                        <Checkbox
                                            id="isActive"
                                            checked={currentCourse.isActive}
                                            onCheckedChange={
                                                handleCheckboxChange
                                            }
                                            className="text-white"
                                        />
                                        <label
                                            htmlFor="isActive"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Active
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="secondary"
                                    onClick={() => setCreateDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">Create Course</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Course Dialog */}
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Edit Course</DialogTitle>
                            <DialogDescription>
                                Update the course information.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpdateCourse}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="edit-name"
                                        className="text-right"
                                    >
                                        Name
                                    </Label>
                                    <Input
                                        id="edit-name"
                                        name="name"
                                        value={currentCourse.name}
                                        onChange={handleInputChange}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="edit-category"
                                        className="text-right"
                                    >
                                        Category
                                    </Label>
                                    <Input
                                        id="edit-category"
                                        name="category"
                                        value={currentCourse.category}
                                        onChange={handleInputChange}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-start gap-4">
                                    <Label
                                        htmlFor="edit-description"
                                        className="text-right pt-2"
                                    >
                                        Description
                                    </Label>
                                    <Textarea
                                        id="edit-description"
                                        name="description"
                                        value={currentCourse.description}
                                        onChange={handleInputChange}
                                        className="col-span-3"
                                        rows={4}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="edit-isActive"
                                        className="text-right"
                                    >
                                        Status
                                    </Label>
                                    <div className="flex items-center space-x-2 col-span-3">
                                        <Checkbox
                                            id="edit-isActive"
                                            checked={currentCourse.isActive}
                                            onCheckedChange={
                                                handleCheckboxChange
                                            }
                                        />
                                        <label
                                            htmlFor="edit-isActive"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Active
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setEditDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">Update Course</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* View Course Dialog */}
                <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Course Details</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <span className="text-right font-medium">
                                    Name:
                                </span>
                                <span className="col-span-3">
                                    {currentCourse.name}
                                </span>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <span className="text-right font-medium">
                                    Category:
                                </span>
                                <span className="col-span-3">
                                    {currentCourse.category}
                                </span>
                            </div>
                            <div className="grid grid-cols-4 items-start gap-4">
                                <span className="text-right font-medium pt-2">
                                    Description:
                                </span>
                                <div className="col-span-3 whitespace-pre-wrap">
                                    {currentCourse.description}
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <span className="text-right font-medium">
                                    Status:
                                </span>
                                <span className="col-span-3">
                                    <span
                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                            currentCourse.isActive
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                        }`}
                                    >
                                        {currentCourse.isActive
                                            ? "Active"
                                            : "Inactive"}
                                    </span>
                                </span>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={() => setViewDialogOpen(false)}>
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <AlertDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete the course &quot;
                                {currentCourse.name}&quot; and remove it from
                                the database.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteCourse}
                                className="bg-red-500 hover:bg-red-600"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </>
    );
}
