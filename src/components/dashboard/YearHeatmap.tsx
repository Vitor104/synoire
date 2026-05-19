import { useMemo } from 'react'
import {
  buildYearHeatmap,
  buildYearHeatmapMonthLabels,
  getYearHeatmapWeekCount,
  yearInTz,
  type StudySessionPoint,
} from '@/lib/dashboard/studyAnalytics'

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'] as const

function heatmapColor(intensity: number): string {
  if (intensity === 0) return 'rgb(26 26 18 / 0.5)'
  return `rgb(163 163 79 / ${0.12 + intensity * 0.18})`
}

type YearHeatmapProps = {
  sessions: StudySessionPoint[]
}

export function YearHeatmap({ sessions }: YearHeatmapProps) {
  const year = yearInTz(new Date())
  const cells = useMemo(() => buildYearHeatmap(sessions, year), [sessions, year])
  const weekCount = useMemo(() => getYearHeatmapWeekCount(cells), [cells])
  const monthLabels = useMemo(() => buildYearHeatmapMonthLabels(cells), [cells])

  if (weekCount === 0) {
    return (
      <p className="text-sm text-secondary">
        Estude em uma sala para ver seu heatmap de constancia.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="relative mb-1 h-4" style={{ minWidth: `${weekCount * 14}px` }}>
        {monthLabels.map(({ weekIndex, label }) => (
          <span
            key={`${weekIndex}-${label}`}
            className="absolute text-[10px] text-secondary"
            style={{ left: `${(weekIndex / weekCount) * 100}%` }}
          >
            {label}
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <div className="flex w-7 shrink-0 flex-col gap-[3px]">
          {DAY_LABELS.map((label) => (
            <span
              key={label}
              className="flex h-3 items-center text-[9px] text-secondary sm:h-3.5"
            >
              {label}
            </span>
          ))}
        </div>
        <div
          className="inline-grid flex-1 gap-[3px]"
          style={{
            gridTemplateColumns: `repeat(${weekCount}, minmax(0, 1fr))`,
            gridTemplateRows: 'repeat(7, minmax(0, 1fr))',
            minWidth: `${weekCount * 14}px`,
          }}
        >
          {cells.map((cell) => (
            <div
              key={cell.dateKey}
              className="aspect-square w-3 rounded-sm sm:w-3.5"
              style={{
                gridColumn: cell.weekIndex + 1,
                gridRow: cell.dayOfWeek + 1,
                backgroundColor: heatmapColor(cell.intensity),
              }}
              title={`${cell.dateKey}: ${cell.minutes} min`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
