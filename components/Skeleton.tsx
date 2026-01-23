interface SkeletonProps {
  type?: 'card' | 'text' | 'image' | 'button'
  count?: number
  className?: string
}

export default function Skeleton({ type = 'text', count = 1, className = '' }: SkeletonProps) {
  const elements = Array.from({ length: count }, (_, i) => i)

  const getSkeletonClass = () => {
    switch (type) {
      case 'card':
        return 'h-48 rounded-lg'
      case 'image':
        return 'h-32 w-32 rounded'
      case 'button':
        return 'h-10 rounded-lg'
      case 'text':
      default:
        return 'h-4 rounded'
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {elements.map((i) => (
        <div
          key={i}
          className={`animate-pulse bg-gray-200 ${getSkeletonClass()}`}
        />
      ))}
    </div>
  )
}

