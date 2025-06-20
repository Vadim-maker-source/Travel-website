import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, getTripById, getUserBookings } from '../../lib/appwrite/api';
import { appwriteConfig } from '../../lib/appwrite/config';

type TripCard = {
  $id: string;
  tripId: string;
  type: 'luxury' | 'budget' | 'medium';
  totalPrice: string;
  calendar: string[];
  status: 'pending' | 'confirmed' | 'cancelled';
  name: string;
  country: string;
  price: string;
  imageId: string[];
  timeStatus: 'completed' | 'active' | 'upcoming';
};

// Функция для безопасного создания даты
const safeCreateDate = (dateString: string): Date | null => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

// Функция форматирования даты
const formatDate = (date: Date | null): string => {
  if (!date) return 'Дата не указана';
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const MyTrips = () => {
  const [trips, setTrips] = useState<TripCard[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getTimeStatus = useCallback((calendar: string[]): 'completed' | 'active' | 'upcoming' => {
    if (!calendar || calendar.length < 2) return 'upcoming';
    
    const now = new Date();
    const startDate = safeCreateDate(calendar[0]);
    const endDate = safeCreateDate(calendar[calendar.length - 1]);
    
    if (!startDate || !endDate) return 'upcoming';
    
    if (now > endDate) return 'completed';
    if (now >= startDate && now <= endDate) return 'active';
    return 'upcoming';
  }, []);

  const updateTimeStatuses = useCallback(() => {
    setTrips(prevTrips => 
      prevTrips.map(trip => ({
        ...trip,
        timeStatus: getTimeStatus(trip.calendar)
      }))
    );
  }, [getTimeStatus]);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          const bookings = await getUserBookings(user.userId);
    
          const detailedTrips = await Promise.all(
            bookings.map(async (booking) => {
              try {
                const trip = await getTripById(booking.hotelId);
                return {
                  $id: booking.$id,
                  tripId: booking.hotelId,
                  type: trip.type,
                  totalPrice: booking.totalPrice,
                  calendar: booking.calendar,
                  status: booking.status,
                  name: trip.name,
                  country: trip.country,
                  price: trip.price,
                  imageId: trip.imageId,
                  timeStatus: getTimeStatus(booking.calendar)
                };
              } catch (error) {
                console.error(`Ошибка при загрузке поездки ${booking.hotelId}:`, error);
                return null;
              }
            })
          );
    
          setTrips(detailedTrips.filter((trip): trip is TripCard => trip !== null));
        }
      } catch (error) {
        console.error('Ошибка при загрузке поездок:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [getTimeStatus]);

  useEffect(() => {
    updateTimeStatuses();
    const intervalId = setInterval(updateTimeStatuses, 60000);
    return () => clearInterval(intervalId);
  }, [updateTimeStatuses]);

  if (loading) return <p className="p-4">Загрузка...</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Мои поездки</h1>

      {trips.length === 0 ? (
        <p>У вас пока нет поездок.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map(trip => {
            const startDate = safeCreateDate(trip.calendar?.[0]);
            const endDate = safeCreateDate(trip.calendar?.[trip.calendar.length - 1]);
            const dateRange = trip.calendar?.length >= 2 
              ? `${formatDate(startDate)} - ${formatDate(endDate)}`
              : 'Даты не указаны';

            return (
              <div
                key={trip.$id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
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

                  <div className="text-gray-600">
                    <span>{dateRange}</span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>
                      Тип: {trip.type === 'luxury' ? 'Люкс' : trip.type === 'budget' ? 'Бюджет' : 'Средний'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                  <div className="text-gray-600">
                    Статус:&nbsp;
                    <span className={`font-semibold ${
                      trip.status === 'confirmed' ? 'text-green-600' :
                      trip.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {trip.status === 'confirmed' ? 'Подтверждено' :
                       trip.status === 'pending' ? 'В ожидании' : 'Отклонено'}
                    </span>
                  </div>
                  
                  {/* Показываем временный статус только для подтвержденных бронирований */}
                  {trip.status === 'confirmed' && trip.timeStatus && (
                    <div className="text-gray-600">
                      Состояние:&nbsp;
                      <span className={`font-semibold ${
                        trip.timeStatus === 'completed' ? 'text-gray-600' :
                        trip.timeStatus === 'active' ? 'text-blue-600' : 'text-purple-600'
                      }`}>
                        {trip.timeStatus === 'completed' ? 'Завершено' :
                         trip.timeStatus === 'active' ? 'В процессе' : 'Скоро начнется'}
                      </span>
                    </div>
                  )}
                </div>

                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="text-lg font-bold text-blue-600">{trip.totalPrice} рублей</span>
                    <button
                      onClick={() => navigate(`/trip/${trip.tripId}`)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                      Подробнее
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyTrips;