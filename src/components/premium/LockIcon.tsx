type LockIconProps = {
  className?: string
}

export function LockIcon({ className = '' }: LockIconProps) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 ${className}`.trim()}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M4.5 7V5a3.5 3.5 0 1 1 7 0v2"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <rect
        x="3"
        y="7"
        width="10"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.25"
      />
    </svg>
  )
}
