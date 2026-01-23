'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Banner {
  id: string
  title: string
  subtitle?: string
  image_url: string
  link_url?: string
}

interface BannerCarouselProps {
  banners: Banner[]
  autoPlayInterval?: number
}

export default function BannerCarousel({ banners, autoPlayInterval = 5000 }: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (banners.length <= 1 || isPaused) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length)
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [banners.length, autoPlayInterval, isPaused])

  if (banners.length === 0) {
    return null
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const goToPrev = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? banners.length - 1 : prevIndex - 1
    )
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length)
  }

  const currentBanner = banners[currentIndex]

  const BannerContent = () => (
    <div className="relative h-64 md:h-96 w-full rounded-lg overflow-hidden">
      <Image
        src={currentBanner.image_url || '/placeholder-1.jpg'}
        alt={currentBanner.title}
        fill
        className="object-cover"
        sizes="100vw"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
      <div className="absolute inset-0 flex items-center p-8">
        <div className="text-white max-w-lg">
          <h2 className="text-2xl md:text-4xl font-bold mb-2">
            {currentBanner.title}
          </h2>
          {currentBanner.subtitle && (
            <p className="text-lg md:text-xl mb-4">
              {currentBanner.subtitle}
            </p>
          )}
          {currentBanner.link_url && (
            <span
              className="inline-block bg-white text-black px-6 py-2 rounded-lg font-semibold"
            >
              Подробнее
            </span>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {currentBanner.link_url ? (
        <Link href={currentBanner.link_url}>
          <BannerContent />
        </Link>
      ) : (
        <BannerContent />
      )}

      {/* Навигация */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 transition-colors"
            aria-label="Предыдущий баннер"
          >
            ←
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 transition-colors"
            aria-label="Следующий баннер"
          >
            →
          </button>

          {/* Индикаторы */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-white scale-125' 
                    : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Перейти к баннеру ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
