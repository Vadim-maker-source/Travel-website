import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { databases, appwriteConfig } from '../../lib/appwrite/config'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import type { IHotel } from '../../types'
import { getCurrentUser } from '../../lib/appwrite/api'

const CardDetails = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [hotel, setHotel] = useState<IHotel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null);
  
  // Состояния для бронирования
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [peopleCount, setPeopleCount] = useState(1)
  const [totalPrice, setTotalPrice] = useState(0)

  useEffect(() => {
      const fetchUser = async () => {
        try {
          const user = await getCurrentUser();
          if (user) {
            setUser(user);
          }
        } catch (e) {
          console.error('Ошибка при загрузке поездок:', e);
        } finally {
          setLoading(false);
        }
      };
  
      fetchUser();
    }, []);

  // Загрузка данных об отеле
  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const response = await databases.getDocument(
          appwriteConfig.databaseId,
          appwriteConfig.tripCollectionId,
          id!
        )
        setHotel(response as unknown as IHotel)
      } catch (err) {
        console.error('Ошибка загрузки отеля:', err)
        setError('Не удалось загрузить данные об отеле')
      } finally {
        setLoading(false)
      }
    }

    fetchHotel()
  }, [id])

  // Расчет общей стоимости
  useEffect(() => {
    if (!hotel || !startDate || !endDate) return

    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const calculatedPrice = Number(hotel.price) * peopleCount * daysDiff
    setTotalPrice(calculatedPrice)
  }, [hotel, startDate, endDate, peopleCount])

  const handleBooking = async () => {
    if (!startDate || !endDate || !hotel) return;
  
    try {
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const bookingData = {
        hotelId: hotel.$id,
        days: days.toString(),
        room: peopleCount.toString(),
        userId: user.$id,
        calendar: [startDate.toISOString(), endDate.toISOString()],
        month: [startDate.toLocaleString('default', { month: 'long' })],
        totalPrice: totalPrice.toString(),
        status: 'pending',
      };
      
      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.bookingCollectionId,
        'unique()',
        bookingData,
      );
      navigate('/success');
    } catch (err) {
      console.error('Ошибка бронирования:', err);
      setError('Не удалось оформить бронирование');
    }
  };

  if (loading) return <div className="text-center py-8">Загрузка...</div>
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>
  if (!hotel) return <div className="text-center py-8">Отель не найден</div>

  return (
    <div className="container mx-auto px-4 py-8 bg-[#f7f7f7]">
      <button 
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Назад
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Галерея изображений */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
          {hotel.imageId.map((imageId, index) => (
            <img
              key={imageId}
              src={`${appwriteConfig.url}/storage/buckets/${appwriteConfig.storageId}/files/${imageId}/view?project=${appwriteConfig.projectId}`}
              alt={`${hotel.name} ${index + 1}`}
              className={`w-full h-64 object-cover rounded ${index === 0 ? 'md:col-span-2 h-80' : 'h-64'}`}
            />
          ))}
        </div>

        {/* Основная информация */}
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-2">{hotel.name}</h1>
          <div className="flex items-center mb-4">
            <svg className="w-5 h-5 text-gray-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-gray-600">{hotel.country}, {hotel.address}</span>
          </div>

          <pre className="text-gray-700 mb-8">{hotel.description}</pre>

          {/* Форма бронирования */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-6">Бронирование</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block mb-2 font-medium">Дата заезда</label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  minDate={new Date()}
                  className="w-full p-2 border rounded"
                  placeholderText="Выберите дату"
                  dateFormat="dd/MM/yyyy"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Дата выезда</label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate || new Date()}
                  className="w-full p-2 border rounded"
                  placeholderText="Выберите дату"
                  dateFormat="dd/MM/yyyy"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block mb-2 font-medium">Количество мест (1-7)</label>
              <select
                value={peopleCount}
                onChange={(e) => setPeopleCount(Number(e.target.value))}
                className="w-full p-2 border rounded"
              >
                {[1, 2, 3, 4, 5, 6, 7].map(num => (
                  <option key={num} value={num}>{num} {num === 1 ? 'место' : num < 5 ? 'места' : 'мест'}</option>
                ))}
              </select>
            </div>

            {totalPrice > 0 && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Итоговая стоимость</h3>
                <p className="text-2xl font-bold text-blue-600">{totalPrice}$</p>
                <p className="text-sm text-gray-600">
                  {Math.ceil((endDate!.getTime() - startDate!.getTime()) / (1000 * 60 * 60 * 24))} дней, 
                  {peopleCount} {peopleCount === 1 ? 'место' : peopleCount < 5 ? 'места' : 'мест'}
                </p>
              </div>
            )}

            <button
              onClick={handleBooking}
              disabled={!startDate || !endDate}
              className={`w-full py-3 px-4 rounded-lg font-bold text-white ${!startDate || !endDate ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              Забронировать
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CardDetails