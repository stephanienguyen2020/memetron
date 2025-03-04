"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"

const assetAllocation = [
  { name: "Layer 1", value: 45, color: "#3b82f6" },
  { name: "Meme Coins", value: 25, color: "#22c55e" },
  { name: "DeFi", value: 15, color: "#eab308" },
  { name: "NFTs", value: 10, color: "#ec4899" },
  { name: "Stablecoins", value: 5, color: "#64748b" },
]

const riskMetrics = [
  { metric: "Portfolio Beta", value: "1.2" },
  { metric: "Sharpe Ratio", value: "2.1" },
  { metric: "Volatility", value: "32.5%" },
  { metric: "Max Drawdown", value: "-25.3%" },
]

export function PortfolioAnalytics() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Asset Allocation</CardTitle>
          <CardDescription>Distribution of your portfolio by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetAllocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {assetAllocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Risk Metrics</CardTitle>
          <CardDescription>Key portfolio risk indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {riskMetrics.map((metric) => (
              <div key={metric.metric} className="flex items-center justify-between p-4 rounded-lg bg-black/40">
                <span className="text-muted-foreground">{metric.metric}</span>
                <span className="font-mono font-bold">{metric.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

