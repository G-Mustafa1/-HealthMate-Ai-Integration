"use client";

import React from 'react'
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Trash2 } from "lucide-react";
import Link from "next/link";
import Swal from 'sweetalert2';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Report {
    _id: string;
    filename: string;
    fileUrl: string;
    title: string;
    dateSeen: string;
    summary: string;
}

const Reports = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await fetch(`${API_URL}/report/myreports`, { credentials: "include" });
                if (!res.ok) throw new Error("Failed to fetch reports");
                const data = await res.json();
                setReports(data.reports || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    // Delete report
    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`${API_URL}/report/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to delete report");

            setReports((prev) => prev.filter((r) => r._id !== id));
            const result = await Swal.fire({
                title: "Are you sure?",
                text: "This action cannot be undone!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, delete it!",
            });

            if (!result.isConfirmed) return;
            // alert("Report deleted successfully!");
        } catch (err: any) {
            console.error(err);
            Swal.fire("Error", err.message || "Error deleting report", "error");
        }
    };


    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }
    return (
        <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
            <h1 className="text-3xl font-bold mb-4">Your Reports</h1>

            {reports.length === 0 ? (
                <p className="text-muted-foreground">No reports uploaded yet. Upload some from your dashboard!</p>
            ) : (
                reports.map((r) => (
                    <Card key={r._id}>
                        <CardHeader className="flex justify-between items-start">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-accent" /> {r.title || r.filename}
                                </CardTitle>
                                <CardDescription>
                                    Date: {r.dateSeen || "Unknown"} <br />
                                    Summary: {r.summary || "No summary available"}
                                </CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Link href={`/dashboard/report-page/${r._id}`} className="text-accent underline">
                                    View
                                </Link>
                                <Button variant="destructive" size="sm" onClick={() => handleDelete(r._id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            File: {r.filename} <br />
                            <a href={r.fileUrl} target="_blank" rel="noreferrer" className="text-accent underline">
                                Download
                            </a>
                        </CardContent>
                    </Card>
                ))
            )}
        </main>
    )
}

export default Reports
