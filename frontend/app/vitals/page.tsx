"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import Swal from "sweetalert2";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Vital {
  _id: string;
  bp?: string;
  sugar?: string;
  weight?: string;
  note?: string;
  date: string;
}

export default function Vitals() {
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ bp: "", sugar: "", weight: "", note: "" });

  const fetchVitals = async () => {
    try {
      const res = await fetch(`${API_URL}/vitals/myvitals`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch vitals");
      const data = await res.json();
      setVitals(data.vitals || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVitals();
  }, []);

  const handleAdd = async () => {
    if (!form.bp && !form.sugar && !form.weight) return Swal.fire("Error", "At least one vital is required", "error");
    try {
      const res = await fetch(`${API_URL}/vitals/add`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add vital");
      setVitals([data.vitals, ...vitals]);
      setForm({ bp: "", sugar: "", weight: "", note: "" });
    } catch (err: any) {
      console.error(err);
      Swal.fire("Error", err.message || "Error adding vital", "error");
      // alert(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
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
      const res = await fetch(`${API_URL}/vitals/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete");
      setVitals(vitals.filter(v => v._id !== id));
    } catch (err: any) {
      console.error(err);
      Swal.fire("Error", err.message || "Error deleting", "error");
      // alert(`Error: ${err.message}`);
    }
  };

  if (loading) return <p className="text-center py-8">Loading vitals...</p>;

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Your Vitals</h2>

      {/* Add Vitals Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Vital</CardTitle>
          <CardDescription>Track your BP, Sugar, Weight, or Notes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <input
            type="text"
            placeholder="BP (e.g., 120/80)"
            className="w-full border p-2 rounded"
            value={form.bp}
            onChange={e => setForm({ ...form, bp: e.target.value })}
          />
          <input
            type="text"
            placeholder="Sugar (mg/dL)"
            className="w-full border p-2 rounded"
            value={form.sugar}
            onChange={e => setForm({ ...form, sugar: e.target.value })}
          />
          <input
            type="text"
            placeholder="Weight (kg)"
            className="w-full border p-2 rounded"
            value={form.weight}
            onChange={e => setForm({ ...form, weight: e.target.value })}
          />
          <input
            type="text"
            placeholder="Note (optional)"
            className="w-full border p-2 rounded"
            value={form.note}
            onChange={e => setForm({ ...form, note: e.target.value })}
          />
          <Button className="w-full" onClick={handleAdd}>Add Vitals</Button>
        </CardContent>
      </Card>

      {/* Display Vitals */}
      {vitals.length === 0 ? (
        <p className="text-muted-foreground">No vitals recorded yet.</p>
      ) : (
        vitals.map(v => (
          <Card key={v._id}>
            <CardHeader className="flex justify-between items-center">
              <div>
                <CardTitle>{new Date(v.date).toLocaleDateString()}</CardTitle>
                <CardDescription>
                  {v.bp && `BP: ${v.bp} | `}
                  {v.sugar && `Sugar: ${v.sugar} | `}
                  {v.weight && `Weight: ${v.weight}`}
                </CardDescription>
              </div>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(v._id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardHeader>
            {v.note && <CardContent>{v.note}</CardContent>}
          </Card>
        ))
      )}
    </main>
  );
}
