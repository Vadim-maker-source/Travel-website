import React from 'react'

type CardProps = {
  images: string[]
  name: string
  type: string
  price: string
  country: string
}

const Card: React.FC<CardProps> = ({ images, name, type, price, country }) => {
  // Берём первую фотку из массива или заглушку, если массив пустой
  const mainImage = images[0] || 'https://via.placeholder.com/300x200?text=No+Image'

  return (
    <div className="max-w-sm rounded-lg overflow-hidden shadow-lg bg-white">
      {/* Картинка (первая из массива) */}
      <img 
        className="w-full h-48 object-cover" 
        src={mainImage} 
        alt={name} 
      />

      {/* Контент */}
      <div className="px-4 py-3">
        {/* Название отеля */}
        <h3 className="font-bold text-xl mb-1 truncate">{name}</h3>

        {/* Статус и цена */}
        <div className="flex justify-between items-center">
          {/* Тип отеля (просто текст, без стилей) */}
          <span className="text-gray-600">{type}</span>
          <span className="text-gray-600">{country}</span>

          {/* Цена */}
          <span className="font-bold">{price}$</span>
        </div>
      </div>
    </div>
  )
}

export default Card