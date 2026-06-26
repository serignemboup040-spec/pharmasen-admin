type Variant = 'green' | 'red' | 'yellow' | 'blue' | 'gray'

const VARIANTS: Record<Variant, string> = {
  green: 'bg-green-100 text-green-700 border-green-200',
  red: 'bg-red-100 text-red-700 border-red-200',
  yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  gray: 'bg-gray-100 text-gray-600 border-gray-200',
}

export default function Badge({
  children,
  variant = 'gray',
}: {
  children: React.ReactNode
  variant?: Variant
}) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${VARIANTS[variant]}`}
    >
      {children}
    </span>
  )
}
