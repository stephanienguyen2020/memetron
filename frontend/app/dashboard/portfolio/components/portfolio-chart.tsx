"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { date: "Jan", value: 100000 },
  { date: "Feb", value: 120000 },
  { date: "Mar", value: 115000 },
  { date: "Apr", value: 130000 },
  { date: "May", value: 145000 },
  { date: "Jun", value: 140000 },
  { date: "Jul", value: 160000 },
  { date: "Aug", value: 155000 },
  { date: "Sep", value: 170000 },
  { date: "Oct", value: 180000 },
  { date: "Nov", value: 175000 },
  { date: "Dec", value: 190000 },
]

export function PortfolioChart() {
  return (
    <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Portfolio Performance</CardTitle>
            <CardDescription>Track your portfolio value over time</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <Tabs defaultValue="value" className="w-[200px]">
              <TabsList>
                <TabsTrigger value="value">Value</TabsTrigger>
                <TabsTrigger value="pl">P/L</TabsTrigger>
              </TabsList>
            </Tabs>
            <Select defaultValue="1Y">
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1D">1D</SelectItem>
                <SelectItem value="1W">1W</SelectItem>
                <SelectItem value="1M">1M</SelectItem>
                <SelectItem value="3M">3M</SelectItem>
                <SelectItem value="1Y">1Y</SelectItem>
                <SelectItem value="ALL">ALL</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#000",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "6px",
                }}
              />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

