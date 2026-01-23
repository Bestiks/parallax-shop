import Image from 'next/image'
import Link from 'next/link'

interface ProductCardProps {
  product: {
    id: string
    title: string
    description: string
    price_rub: number
    category: string
    subcategory?: string
    image_url?: string
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 w-full">
        <Image
          src={product.image_url || '/placeholder-1.jpg'}
          alt={product.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg truncate">{product.title}</h3>
          <span className="text-primary-600 font-bold text-lg whitespace-nowrap">
            {product.price_rub.toLocaleString('ru-RU')} ₽
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {product.category}
            {product.subcategory && ` / ${product.subcategory}`}
          </span>
          
          <Link 
            href={`/catalog?product=${product.id}`}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Подробнее
          </Link>
        </div>
      </div>
    </div>
  )
}

