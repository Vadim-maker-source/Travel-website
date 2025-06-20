import { useState, useEffect } from 'react';
import { databases, appwriteConfig } from '../../lib/appwrite/config';
import type { IHotel, Booking } from '../../types';
import { getCurrentUser } from '../../lib/appwrite/api';
import { Query } from 'appwrite';
import { sendBookingEmail } from '../../consants/sendBookingEmail';

const MyHotels = () => {
  const [hotels, setHotels] = useState<IHotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<IHotel | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingCounts, setPendingCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.tripCollectionId,
            [Query.equal('userId', currentUser.$id)]
          );
          const hotelsData = response.documents as unknown as IHotel[];
          setHotels(hotelsData);

          const counts: Record<string, number> = {};
          for (const hotel of hotelsData) {
            const bookingsResponse = await databases.listDocuments(
              appwriteConfig.databaseId,
              appwriteConfig.bookingCollectionId,
              [
                Query.equal('hotelId', hotel.$id),
                Query.equal('status', 'pending')
              ]
            );
            counts[hotel.$id] = bookingsResponse.total;
          }
          setPendingCounts(counts);
        }
      } catch (error) {
        console.error('Error fetching hotels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  useEffect(() => {
    if (selectedHotel) {
      const fetchBookings = async () => {
        try {
          const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.bookingCollectionId,
            [Query.equal('hotelId', selectedHotel.$id)]
          );
          
          const bookingsData = response.documents.map(doc => ({
            $id: doc.$id,
            $createdAt: doc.$createdAt,
            hotelId: doc.hotelId,
            days: doc.days,
            room: doc.room,
            userId: doc.userId,
            calendar: doc.calendar,
            month: doc.month,
            totalPrice: doc.totalPrice,
            status: doc.status as 'pending' | 'confirmed' | 'cancelled'
          })) as Booking[];
          
          setBookings(bookingsData);
        } catch (error) {
          console.error('Error fetching bookings:', error);
        }
      };

      fetchBookings();
    }
  }, [selectedHotel]);

  const handleBookingAction = async (bookingId: string, action: 'approve' | 'reject') => {
    try {
      const status = action === 'approve' ? 'confirmed' : 'cancelled';
  
      // Обновляем статус в Appwrite
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.bookingCollectionId,
        bookingId,
        { status }
      );
  
      // Обновляем локальное состояние
      setBookings(bookings.map(b =>
        b.$id === bookingId ? { ...b, status } : b
      ));
  
      if (selectedHotel) {
        const newPendingCount = bookings.filter(b =>
          b.$id !== bookingId && b.status === 'pending'
        ).length;
  
        setPendingCounts(prev => ({
          ...prev,
          [selectedHotel.$id]: newPendingCount
        }));
      }
  
      // Получаем email пользователя по его ID (из Appwrite)
      const booking = bookings.find(b => b.$id === bookingId);
      if (!booking) return;
  
      const userResponse = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId, // <--- Убедись, что это правильный ID коллекции пользователей
        booking.userId
      );
  
      const userEmail = userResponse.email;
      if (!userEmail) {
        console.warn('Email пользователя не найден');
        return;
      }
  
      // Отправляем email
      await sendBookingEmail({
        email: userEmail,
        status,
        hotelName: String(selectedHotel?.name),
        bookingId,
        totalPrice: Number(booking.totalPrice),
      });
  
    } catch (error) {
      console.error('Ошибка при обработке бронирования:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Мои отели</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Список отелей */}
        <div className="md:col-span-1">
          <h2 className="text-lg font-semibold mb-4">Выберите отель</h2>
          <div className="space-y-2">
            {hotels.map(hotel => (
              <div 
                key={hotel.$id}
                onClick={() => setSelectedHotel(hotel)}
                className={`p-3 border rounded cursor-pointer ${selectedHotel?.$id === hotel.$id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`}
              >
                <div className="flex justify-between items-center">
                  <span>{hotel.name}</span>
                  {pendingCounts[hotel.$id] > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {pendingCounts[hotel.$id]}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Бронирования выбранного отеля */}
        <div className="md:col-span-3">
          {selectedHotel ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Бронирования для {selectedHotel.name}</h2>
                {pendingCounts[selectedHotel.$id] > 0 && (
                  <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full">
                    Новых бронирований: {pendingCounts[selectedHotel.$id]}
                  </span>
                )}
              </div>
              
              {bookings.length === 0 ? (
                <p>Нет бронирований</p>
              ) : (
                <div className="space-y-4">
                  {bookings.map(booking => (
                    <div key={booking.$id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Бронирование #{booking.$id.slice(0, 6)}</p>
                          <p className="text-sm text-gray-600">
                            {booking.days} дней, {booking.room} мест
                          </p>
                          <p className="text-sm text-gray-600">
                            Сумма: {booking.totalPrice}$
                          </p>
                        </div>
                        
                        <div className="flex space-x-2">
                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleBookingAction(booking.$id, 'approve')}
                                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                              >
                                Принять
                              </button>
                              <button
                                onClick={() => handleBookingAction(booking.$id, 'reject')}
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                              >
                                Отклонить
                              </button>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded">
                              Подтверждено
                            </span>
                          )}
                          {booking.status === 'cancelled' && (
                            <span className="px-3 py-1 bg-red-100 text-red-800 rounded">
                              Отклонено
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p>Выберите отель для просмотра бронирований</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyHotels;