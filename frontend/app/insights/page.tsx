"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Insight {
  _id: string;
  reportTitle: string;
  summary: string;
  explanation_en: string;
  explanation_ro: string;
}

export default function Insights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await fetch(`${API_URL}/report/insights`, { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        setInsights(data.insights || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  if (loading) return <p className="text-center py-8">Loading insights...</p>;

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-4">
      <h2 className="text-2xl font-bold mb-4">AI Insights</h2>
      {insights.length === 0 ? (
        <p className="text-muted-foreground">No insights available yet. Upload reports first.</p>
      ) : (
        insights.map((ins) => (
          <Card key={ins._id}>
            <CardHeader>
              <CardTitle>{ins.reportTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Summary:</strong> {ins.summary}</p>
              <p><strong>Explanation (EN):</strong> {ins.explanation_en}</p>
              <p><strong>Explanation (Roman Urdu):</strong> {ins.explanation_ro}</p>
            </CardContent>
          </Card>
        ))
      )}
    </main>
  );
}
