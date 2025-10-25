"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { FileText, Heart } from "lucide-react";
import Swal from "sweetalert2";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Report {
    _id: string;
    filename: string;
    fileUrl: string;
    title: string;
    dateSeen: string;
    summary: string;
    explanation_en: string;
    explanation_ro: string;
    suggested_questions: string[];
    createdAt: string;
    updatedAt: string;
}

export default function ReportPage() {
    const params = useParams();
    const router = useRouter();
    const [report, setReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchReport = async () => {
            if (!params.id) return setError("Invalid report ID");

            try {
                const token = localStorage.getItem("token")?.replace(/"/g, "") || "";
                if (!token) throw new Error("Not authenticated");

                const res = await fetch(`${API_URL}/report/${params.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                const data = await res.json();
                // console.log("Response status:", res.status);
                // const data = await res.json();
                // console.log("Response data:", data);
                if (!res.ok) throw new Error(data.message || "Failed to fetch report");
                setReport(data.report);
            } catch (err: any) {
                console.error("Error fetching report:", err);
                setError(err.message || "Something went wrong");
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [params.id]);

    const handleDelete = async () => {
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

        try {
            const token = localStorage.getItem("token")?.replace(/"/g, "") || "";
            if (!token) throw new Error("Not authenticated");

            const res = await fetch(`${API_URL}/report/${params.id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to delete report");

            Swal.fire("Deleted!", "Your report has been deleted.", "success");
            router.push("/dashboard");
        } catch (err: any) {
            console.error(err);
            Swal.fire("Error", err.message || "Error deleting report", "error");
        }
    };

    const handleBack = () => {
        if (window.history.length > 1) router.back();
        else router.push("/dashboard");
    };

    if (loading)
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner className="mr-2 w-6 h-6 animate-spin" />
                Loading report...
            </div>
        );

    if (error)
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p className="text-red-500 text-lg mb-4">{error}</p>
                <Button onClick={handleBack}>Go Back</Button>
            </div>
        );

    if (!report)
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p className="text-muted-foreground">Report not found</p>
                <Button onClick={handleBack}>Go Back</Button>
            </div>
        );

    return (
        <div className="min-h-screen p-4 max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <Heart className="w-5 h-5 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-bold">HealthMate Report</h1>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-md space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-accent" /> {report.title || report.filename}
                </h2>

                <p><strong>Date:</strong> {report.dateSeen || "Unknown"}</p>

                {report.fileUrl ? (
                    <p>
                        <strong>File:</strong>{" "}
                        <a href={report.fileUrl} target="_blank" rel="noreferrer" className="text-accent underline">
                            View File
                        </a>
                    </p>
                ) : (
                    <p className="text-muted-foreground">No file available</p>
                )}

                <div>
                    <strong>Summary:</strong>
                    <p className="mt-1">{report.summary || "No summary available"}</p>
                </div>

                <div>
                    <strong>Explanation (EN):</strong>
                    <p className="mt-1">{report.explanation_en || "No explanation"}</p>
                </div>

                <div>
                    <strong>Explanation (UR):</strong>
                    <p className="mt-1">{report.explanation_ro || "No explanation"}</p>
                </div>

                {report.suggested_questions?.length > 0 && (
                    <div>
                        <strong>Suggested Questions:</strong>
                        <ul className="list-disc list-inside mt-1">
                            {report.suggested_questions.map((q, i) => (
                                <li key={i}>{q}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="mt-4 flex gap-2">
                    <Button onClick={handleBack}>Go Back</Button>
                    <Button variant="destructive" onClick={handleDelete}>Delete Report</Button>
                </div>
            </div>
        </div>
    );
}
