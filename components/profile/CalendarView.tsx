'use client'

import { useState } from 'react'

type Props = {
  postedDates: string[]
}

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']
const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

export default function CalendarView({ postedDates }: Props) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const postedSet = new Set(postedDates.map((d) => d.slice(0, 10)))

  function prevMonth() {
    if (month === 0) {
      setYear(year - 1)
      setMonth(11)
    } else {
      setMonth(month - 1)
    }
  }

  function nextMonth() {
    if (month === 11) {
      setYear(year + 1)
      setMonth(0)
    } else {
      setMonth(month + 1)
    }
  }

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1))

  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="text-muted hover:text-primary transition-colors px-2 py-1">‹</button>
        <span className="font-mincho text-sm text-primary">{year}年 {MONTHS[month]}</span>
        <button onClick={nextMonth} className="text-muted hover:text-primary transition-colors px-2 py-1">›</button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-xs text-muted py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const hasPost = postedSet.has(dateStr)
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

          return (
            <div
              key={day}
              className={`aspect-square flex items-center justify-center rounded-full text-xs transition-colors
                ${hasPost ? 'bg-accent text-white font-medium' : ''}
                ${isToday && !hasPost ? 'ring-1 ring-accent text-accent' : ''}
                ${!hasPost && !isToday ? 'text-muted' : ''}
              `}
            >
              {day}
            </div>
          )
        })}
      </div>
    </div>
  )
}
