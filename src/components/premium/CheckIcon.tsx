type CheckIconProps = {
  className?: string
}

export function CheckIcon({ className = '' }: CheckIconProps) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 ${className}`.trim()}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M3 8.5 6.5 12 13 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
