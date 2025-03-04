"use client"

import { useEffect, useState } from "react"
import { Clock } from "lucide-react"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import duration from "dayjs/plugin/duration"

dayjs.extend(relativeTime)
dayjs.extend(duration)

export function TimeLeft({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState("")

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = dayjs()
      const end = dayjs(endDate)
      const diff = end.diff(now)

      if (diff <= 0) {
        setTimeLeft("Ended")
        return
      }

      const duration = dayjs.duration(diff)
      const days = Math.floor(duration.asDays())
      const hours = duration.hours()
      const minutes = duration.minutes()

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h left`)
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m left`)
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m left`)
      } else {
        setTimeLeft("< 1m left")
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [endDate])

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <Clock className="h-4 w-4 text-muted-foreground" />
      <span className={timeLeft === "Ended" ? "text-red-500" : "text-muted-foreground"}>{timeLeft}</span>
    </div>
  )
}

