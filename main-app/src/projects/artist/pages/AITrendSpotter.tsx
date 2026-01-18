"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  Sparkles,
  Calendar,
  Lightbulb,
  Target,
  ArrowUp,
  ArrowDown
} from "lucide-react"

type Trend = {
  id: string
  title: string
  description: string
  level: string
  momentum: string
  timeFrame: string
  categories: string[]
  actions: string[]
  confidenceScore: number
}

export default function AITrendSpotter() {
  const [trends, setTrends] = useState<Trend[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 👇 FIXED: Uses AWS Environment Variable (Render Backend)
    // Fallback to localhost only if running on your laptop
    const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

    fetch(`${API_URL}/api/trends?limit=10`)
      .then(res => res.json())
      .then(data => {
        // Safety check: ensure 'data.data' is an array
        setTrends(data.data || [])
        setLoading(false)
      })
      .catch((error) => {
        console.error("Failed to fetch trends:", error);
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="text-muted-foreground p-6">Loading trends...</div>
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">AI Trend Spotter</h1>
          <p className="text-muted-foreground">
            Live market insights powered by real search trends
          </p>
        </div>
      </div>

      {/* Context */}
      <Card className="bg-primary/5">
        <CardContent className="p-4 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-primary" />
          <div>
            <div className="font-medium">Current Analysis Window</div>
            <div className="text-sm text-muted-foreground">
              Based on recent online search behavior
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trends */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Trending Opportunities
        </h2>

        {trends.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No trends found at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {trends.map(trend => (
              <Card key={trend.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{trend.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">{trend.level}</Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      {/* {getMomentumIcon(trend.momentum)} */}
                      {trend.momentum}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{trend.description}</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium">Time Frame</div>
                      <div className="text-sm text-muted-foreground">
                        {trend.timeFrame}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium">Confidence</div>
                      <div className="text-sm text-muted-foreground">
                        {Math.round(trend.confidenceScore)}%
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium flex items-center gap-1 mb-2">
                      <Lightbulb className="w-4 h-4" />
                      Suggested Actions
                    </div>
                    <ul className="space-y-1">
                      {trend.actions.map((action, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground">
                          • {action}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button className="w-full">
                    <Target className="w-4 h-4 mr-2" />
                    Create Listing for This Trend
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}