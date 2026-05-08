export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-baseline gap-0">
            <span className="text-2xl font-medium tracking-tight text-gray-900">Body</span>
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mb-0.5 mx-0.5" />
            <span className="text-2xl font-medium tracking-tight text-gray-900">logy</span>
          </div>
          <p className="text-xs text-gray-400 tracking-widest uppercase mt-1">Your training partner</p>
        </div>
        {children}
      </div>
    </div>
  )
}
