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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { API_URL } from "./constants";
import { useNavigate } from "react-router";

// Course type definition
interface Course {
    id: number;
    name: string;
    description: string;
    isActive: boolean;
    category: string;
}

// Assignment type definition based on your TypeORM entity
interface Assignment {
    id: number;
    userId: number;
    courseId: number;
    name: string;
    description: string;
    isFinished: boolean;
}

// Initial empty assignment for the create form
const emptyAssignment: Assignment = {
    id: 0,
    userId: 1, // Default user ID, you might want to get this from authentication
    courseId: 0,
    name: "",
    description: "",
    isFinished: false,
};

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

export default function AssignmentManagement() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(
        null
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Dialog states
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [currentAssignment, setCurrentAssignment] =
        useState<Assignment>(emptyAssignment);

    // Fetch all courses on component mount
    useEffect(() => {
        fetchCourses();
    }, []);

    // Fetch assignments when a course is selected
    useEffect(() => {
        if (selectedCourseId) {
            fetchAssignments(selectedCourseId);
        } else {
            setAssignments([]);
            setLoading(false);
        }
    }, [selectedCourseId]);

    const fetchCourses = async () => {
        try {
            const response = await fetch(`${API_URL}/courses`);
            if (!response.ok) {
                throw new Error("Failed to fetch courses");
            }
            const data = await response.json();
            setCourses(data);

            // If there are courses, select the first one by default
            if (data.length > 0) {
                setSelectedCourseId(data[0].id);
            } else {
                setLoading(false);
            }
        } catch (err) {
            setError("Error loading courses. Please try again later.");
            console.error(err);
            setLoading(false);
        }
    };

    const fetchAssignments = async (courseId: number) => {
        setLoading(true);
        try {
            const response = await fetch(
                `${API_URL}/assignments/course/${courseId}`
            );
            if (!response.ok) {
                throw new Error("Failed to fetch assignments");
            }
            const data = await response.json();
            setAssignments(data);
        } catch (err) {
            setError("Error loading assignments. Please try again later.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAssignment = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const assignmentToCreate = {
                ...currentAssignment,
                courseId: selectedCourseId,
            };

            const response = await fetch(`${API_URL}/assignments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(assignmentToCreate),
            });

            if (!response.ok) {
                throw new Error("Failed to create assignment");
            }

            if (selectedCourseId) {
                await fetchAssignments(selectedCourseId);
            }
            setCreateDialogOpen(false);
            setCurrentAssignment(emptyAssignment);
            toast("Success", {
                description: "Assignment created successfully",
            });
        } catch (err) {
            console.error(err);
            toast("Error", {
                description: "Failed to create assignment. Please try again.",
            });
        }
    };

    const handleUpdateAssignment = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(
                `${API_URL}/assignments/${currentAssignment.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(currentAssignment),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update assignment");
            }

            if (selectedCourseId) {
                await fetchAssignments(selectedCourseId);
            }
            setEditDialogOpen(false);
            toast("Success", {
                description: "Assignment updated successfully",
            });
        } catch (err) {
            console.error(err);
            toast("Error", {
                description: "Failed to update assignment. Please try again.",
            });
        }
    };

    const handleDeleteAssignment = async () => {
        try {
            const response = await fetch(
                `${API_URL}/assignments/${currentAssignment.id}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                throw new Error("Failed to delete assignment");
            }

            if (selectedCourseId) {
                await fetchAssignments(selectedCourseId);
            }
            setDeleteDialogOpen(false);
            toast("Success", {
                description: "Assignment deleted successfully",
            });
        } catch (err) {
            console.error(err);
            toast("Error", {
                description: "Failed to delete assignment. Please try again.",
            });
        }
    };

    const handleCourseChange = (courseId: string) => {
        setSelectedCourseId(Number(courseId));
    };

    const openCreateDialog = () => {
        setCurrentAssignment({
            ...emptyAssignment,
            courseId: selectedCourseId || 0,
        });
        setCreateDialogOpen(true);
    };

    const openEditDialog = (assignment: Assignment) => {
        setCurrentAssignment(assignment);
        setEditDialogOpen(true);
    };

    const openDeleteDialog = (assignment: Assignment) => {
        setCurrentAssignment(assignment);
        setDeleteDialogOpen(true);
    };

    const openViewDialog = (assignment: Assignment) => {
        setCurrentAssignment(assignment);
        setViewDialogOpen(true);
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setCurrentAssignment((prev) => ({
            ...prev,
            [name]: name === "userId" ? Number(value) : value,
        }));
    };

    const handleCheckboxChange = (checked: boolean) => {
        setCurrentAssignment((prev) => ({
            ...prev,
            isFinished: checked,
        }));
    };

    const getSelectedCourseName = () => {
        if (!selectedCourseId) return "Select a course";
        const course = courses.find((c) => c.id === selectedCourseId);
        return course ? course.name : "Unknown course";
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
                                Assignment Management
                            </CardTitle>
                            <CardDescription>
                                Create, view, edit, and delete assignments for
                                courses in the LinKasa learning platform.
                            </CardDescription>
                        </div>
                        {selectedCourseId && (
                            <Button onClick={openCreateDialog}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Assignment
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6">
                            <Label htmlFor="course-select">Select Course</Label>
                            <Select
                                value={selectedCourseId?.toString() || ""}
                                onValueChange={handleCourseChange}
                            >
                                <SelectTrigger className="w-full md:w-[300px] mt-2">
                                    <SelectValue placeholder="Select a course" />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map((course) => (
                                        <SelectItem
                                            key={course.id}
                                            value={course.id.toString()}
                                        >
                                            {course.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : error ? (
                            <div className="text-center text-red-500 p-4">
                                {error}
                            </div>
                        ) : !selectedCourseId ? (
                            <div className="text-center p-8">
                                <p className="text-muted-foreground mb-4">
                                    Please select a course to view its
                                    assignments
                                </p>
                            </div>
                        ) : assignments.length === 0 ? (
                            <div className="text-center p-8">
                                <p className="text-muted-foreground mb-4">
                                    No assignments found for this course
                                </p>
                                <Button onClick={openCreateDialog}>
                                    Create your first assignment
                                </Button>
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>User ID</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {assignments.map((assignment) => (
                                            <TableRow key={assignment.id}>
                                                <TableCell className="font-medium">
                                                    {assignment.name}
                                                </TableCell>
                                                <TableCell>
                                                    {assignment.userId}
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                            assignment.isFinished
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-blue-100 text-blue-800"
                                                        }`}
                                                    >
                                                        {assignment.isFinished
                                                            ? "Finished"
                                                            : "In Progress"}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() =>
                                                                openViewDialog(
                                                                    assignment
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
                                                                    assignment
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
                                                                    assignment
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

                {/* Create Assignment Dialog */}
                <Dialog
                    open={createDialogOpen}
                    onOpenChange={setCreateDialogOpen}
                >
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Create New Assignment</DialogTitle>
                            <DialogDescription>
                                Add a new assignment to{" "}
                                {getSelectedCourseName()}.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateAssignment}>
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
                                        value={currentAssignment.name}
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
                                        value={currentAssignment.description}
                                        onChange={handleInputChange}
                                        className="col-span-3"
                                        rows={4}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="userId"
                                        className="text-right"
                                    >
                                        User ID
                                    </Label>
                                    <Input
                                        id="userId"
                                        name="userId"
                                        type="number"
                                        min="1"
                                        value={currentAssignment.userId}
                                        onChange={handleInputChange}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="isFinished"
                                        className="text-right"
                                    >
                                        Status
                                    </Label>
                                    <div className="flex items-center space-x-2 col-span-3">
                                        <Checkbox
                                            id="isFinished"
                                            checked={
                                                currentAssignment.isFinished
                                            }
                                            onCheckedChange={
                                                handleCheckboxChange
                                            }
                                        />
                                        <label
                                            htmlFor="isFinished"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Finished
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setCreateDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">Create Assignment</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Assignment Dialog */}
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Edit Assignment</DialogTitle>
                            <DialogDescription>
                                Update the assignment information.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpdateAssignment}>
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
                                        value={currentAssignment.name}
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
                                        value={currentAssignment.description}
                                        onChange={handleInputChange}
                                        className="col-span-3"
                                        rows={4}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="edit-userId"
                                        className="text-right"
                                    >
                                        User ID
                                    </Label>
                                    <Input
                                        id="edit-userId"
                                        name="userId"
                                        type="number"
                                        min="1"
                                        value={currentAssignment.userId}
                                        onChange={handleInputChange}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="edit-isFinished"
                                        className="text-right"
                                    >
                                        Status
                                    </Label>
                                    <div className="flex items-center space-x-2 col-span-3">
                                        <Checkbox
                                            id="edit-isFinished"
                                            checked={
                                                currentAssignment.isFinished
                                            }
                                            onCheckedChange={
                                                handleCheckboxChange
                                            }
                                        />
                                        <label
                                            htmlFor="edit-isFinished"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Finished
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
                                <Button type="submit">Update Assignment</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* View Assignment Dialog */}
                <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Assignment Details</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <span className="text-right font-medium">
                                    Name:
                                </span>
                                <span className="col-span-3">
                                    {currentAssignment.name}
                                </span>
                            </div>
                            <div className="grid grid-cols-4 items-start gap-4">
                                <span className="text-right font-medium pt-2">
                                    Description:
                                </span>
                                <div className="col-span-3 whitespace-pre-wrap">
                                    {currentAssignment.description}
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <span className="text-right font-medium">
                                    User ID:
                                </span>
                                <span className="col-span-3">
                                    {currentAssignment.userId}
                                </span>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <span className="text-right font-medium">
                                    Course:
                                </span>
                                <span className="col-span-3">
                                    {getSelectedCourseName()}
                                </span>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <span className="text-right font-medium">
                                    Status:
                                </span>
                                <span className="col-span-3">
                                    <span
                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                            currentAssignment.isFinished
                                                ? "bg-green-100 text-green-800"
                                                : "bg-blue-100 text-blue-800"
                                        }`}
                                    >
                                        {currentAssignment.isFinished
                                            ? "Finished"
                                            : "In Progress"}
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
                                permanently delete the assignment &quot;
                                {currentAssignment.name}
                                &quot; and remove it from the database.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteAssignment}
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
