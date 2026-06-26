export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-sm">{children}</table>
    </div>
  )
}

export function Thead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-gray-50 border-b border-gray-200">
      <tr>{children}</tr>
    </thead>
  )
}

export function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
      {children}
    </th>
  )
}

export function Tbody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-gray-100">{children}</tbody>
}

export function Tr({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <tr className={`hover:bg-gray-50 transition-colors ${className}`}>{children}</tr>
}

export function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-gray-700 ${className}`}>{children}</td>
}
