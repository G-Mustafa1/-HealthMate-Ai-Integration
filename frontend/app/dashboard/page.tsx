"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, FileText, Activity } from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface User {
  id?: string;
  firstname?: string;
  lastname?: string;
  name?: string;
  email?: string;
}

interface Report {
  _id: string;
  filename: string;
  fileUrl: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user + reports
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_URL}/profile/getuser`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          router.push("/");
          return;
        }

        const data = await res.json();
        setUser(data.user);

        const reportRes = await fetch(`${API_URL}/report/myreports`, {
          method: "GET",
          credentials: "include",
        });

        if (reportRes.ok) {
          const reportData = await reportRes.json();
          setReports(reportData.reports || []);
        }
      } catch (error) {
        console.error(error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  // Upload button trigger
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Upload report to Cloudinary via backend
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return Swal.fire("Error", "No file selected", "error");

    const allowed = ["application/pdf", "image/png", "image/jpeg"];
    if (!allowed.includes(file.type)) {
      return Swal.fire("Error", "Only PDF, PNG, JPG allowed!", "error");
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/report/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      Swal.fire("Success", "Report uploaded successfully!", "success");

      // ✅ Add newly uploaded Cloudinary report to state
      setReports((prev) => [data.report, ...prev]);
    } catch (err: any) {
      console.error(err);
      Swal.fire("Error", err.message || "Error uploading file", "error");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome, {user?.firstname ? `${user.firstname} ${user.lastname}` : user?.name || "User"}!
          </h2>
          <p className="text-muted-foreground">Manage your health reports and vitals in one place</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-accent" /> Upload Report
              </CardTitle>
              <CardDescription>Upload medical reports for AI analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={handleUploadClick}>
                Upload PDF or Image
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
                onChange={handleFileChange}
              />
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-accent" /> Add Vitals
              </CardTitle>
              <CardDescription>Manually track BP, Sugar, Weight, etc.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Record Vitals</Button>
            </CardContent>
          </Card>
        </div>

        {/* Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent" /> Your Reports
            </CardTitle>
            <CardDescription>All your uploaded medical reports</CardDescription>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">No reports uploaded yet</p>
                <Button onClick={handleUploadClick}>Upload Your First Report</Button>
              </div>
            ) : (
              <ul className="space-y-3">
                {reports.map((r) => (
                  <li
                    key={r._id}
                    className="flex justify-between items-center border p-2 rounded-md hover:shadow-md"
                  >
                    <span>{r.filename}</span>
                    {/* ✅ View Cloudinary file directly */}
                    <Link href={`/dashboard/report-page/${r._id}`} className="text-accent underline">
                      View
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
