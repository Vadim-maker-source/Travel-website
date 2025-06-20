import { useEffect, useState } from 'react'
import { appwriteConfig, databases } from '../../lib/appwrite/config'
import { COUNTRIES } from '../../consants/countries'
import { useNavigate } from 'react-router-dom'

type Trip = {
  $id: string
  name: string
  description: string
  type: 'luxury' | 'budget' | 'medium'
  address: string
  country: string
  price: string
  userId: string
  imageId: string[]
  status: boolean
  $createdAt: string
}

const Home = () => {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const navigate = useNavigate();
  
  // Состояния для фильтров
  const [countryFilter, setCountryFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [dateSort, setDateSort] = useState<'newest' | 'oldest'>('newest')

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.tripCollectionId
        )
        setTrips(response.documents as unknown as Trip[])
      } catch (err) {
        console.error('Ошибка загрузки поездок:', err)
        setError('Не удалось загрузить поездки')
      } finally {
        setLoading(false)
      }
    }

    fetchTrips()
  }, [])

  // Фильтрация и сортировка
  const filteredTrips = trips.filter(trip => {
    const matchesCountry = countryFilter ? trip.country === countryFilter : true
    const matchesType = typeFilter ? trip.type === typeFilter : true
    const matchesSearch = searchQuery ? 
      trip.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
    return matchesCountry && matchesType && matchesSearch
  }).sort((a, b) => {
    if (dateSort === 'newest') {
      return new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
    } else {
      return new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime()
    }
  })

  if (loading) return <div>Загрузка...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div className="container mx-auto px-4 py-8 bg-[#f7f7f7]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Список поездок</h1>
        
        {/* Поисковая строка */}
        <div className="w-full md:w-64 lg:w-96">
          <div className="relative">
            <input
              type="text"
              placeholder="Поиск по названию или описанию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 pl-10 pr-4 text-gray-700 bg-white rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Фильтры */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Страна</label>
          <div className="relative">
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="w-full p-2 pl-3 pr-8 text-gray-700 bg-white rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Все страны</option>
              {COUNTRIES.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Тип</label>
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full p-2 pl-3 pr-8 text-gray-700 bg-white rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Все типы</option>
              <option value="luxury">Люкс</option>
              <option value="medium">Средний</option>
              <option value="budget">Бюджет</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Дата</label>
          <div className="relative">
            <select
              value={dateSort}
              onChange={(e) => setDateSort(e.target.value as 'newest' | 'oldest')}
              className="w-full p-2 pl-3 pr-8 text-gray-700 bg-white rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Сначала новые</option>
              <option value="oldest">Сначала старые</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Список поездок */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrips.map(trip => (
          <div key={trip.$id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            {trip.imageId.length > 0 && (
              <img
                src={`${appwriteConfig.url}/storage/buckets/${appwriteConfig.storageId}/files/${trip.imageId[0]}/view?project=${appwriteConfig.projectId}`}
                alt={trip.name}
                className="w-full h-64 object-cover"
              />
            )}
            
            <div className="p-4 space-y-3">
              <h2 className="text-xl font-bold text-gray-800">{trip.name}</h2>
              <div className="flex items-center text-gray-600">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{trip.country}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>Тип: {trip.type === 'luxury' ? 'Люкс' : trip.type === 'budget' ? 'Бюджет' : 'Средний'}</span>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-lg font-bold text-blue-600">{trip.price} рублей</span>
                <button 
                  onClick={() => navigate(`/trip/${trip.$id}`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Подробнее
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Home