import { useState, useEffect } from 'react'
import type { IUser } from '../../types'
import { appwriteConfig, databases } from '../../lib/appwrite/config'
import { getUserById } from '../../lib/appwrite/api'

type HotelRequest = {
  $id: string
  name: string
  description: string
  type: string
  address: string
  country: string
  price: string
  userId: string
  imageId: string[]
  status: boolean
}

const AdminPage = () => {
  const [isAdmin, setIsAdmin] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [requests, setRequests] = useState<HotelRequest[]>([])
  const [users, setUsers] = useState<Record<string, IUser>>({})
  const [loading, setLoading] = useState(false)

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.requestCollectionId
      )

      const requestsData = response.documents as unknown as HotelRequest[]
      setRequests(requestsData)

      const usersData: Record<string, IUser> = {}
      for (const request of requestsData) {
        if (!usersData[request.userId]) {
          const user = await getUserById(request.userId)
          if (user) {
            usersData[request.userId] = user
          }
        }
      }
      setUsers(usersData)
    } catch (err) {
      console.error('Ошибка при загрузке заявок:', err)
      setError('Произошла ошибка при загрузке данных')
    } finally {
      setLoading(false)
    }
  }

  const submitPassword = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (password === import.meta.env.VITE_APPWRITE_ADMIN_PASSWORD) {
        setIsAdmin(true)
        fetchRequests()
      } else {
        setError('Неверный пароль')
      }
    } catch (err) {
      setError('Произошла ошибка при авторизации')
      console.error(err)
    }
  }

  const updateRequestStatus = async (id: string, status: boolean) => {
    try {
      const request = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.requestCollectionId,
        id
      ) as unknown as HotelRequest;
  
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.requestCollectionId,
        id,
        { status }
      );
  
      if (status) {
        await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.tripCollectionId,
          id,
          {
            name: request.name,
            description: request.description,
            type: request.type,
            address: request.address,
            country: request.country,
            price: request.price,
            userId: request.userId,
            imageId: request.imageId,
            status: true
          }
        );
      } else {
        try {
          await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.tripCollectionId,
            id
          );
        } catch (e) {
          console.log('Документ не найден в коллекции Trips');
        }
      }
  
      setRequests(prev => 
        prev.map(req => req.$id === id ? { ...req, status } : req))
  
    } catch (err) {
      console.error('Ошибка при обновлении:', err);
      setError('Не удалось обновить статус');
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchRequests()
    }
  }, [isAdmin])

  return isAdmin ? (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Панель администратора</h1>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            Заявок: {requests.length}
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map(request => (
              <div 
                key={request.$id} 
                className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 ${
                  request.status ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
                }`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{request.name}</h3>
                      <div className="flex items-center mt-1 text-gray-600">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{request.address}, {request.country}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      request.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {request.status ? 'Одобрено' : 'На рассмотрении'}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-700 mb-2">Описание</h4>
                        <p className="text-gray-600">{request.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-700 mb-1">Тип</h4>
                          <p className="text-gray-600 capitalize">{request.type}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700 mb-1">Цена</h4>
                          <p className="text-gray-600">{request.price} ₽</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Фотографии</h4>
                      <div className="flex flex-wrap gap-3">
                        {request.imageId.map(image => (
                          <img 
                            key={image} 
                            src={`${appwriteConfig.url}/storage/buckets/${appwriteConfig.storageId}/files/${image}/view?project=${appwriteConfig.projectId}`} 
                            alt="Отель" 
                            className="w-24 h-24 rounded-md object-cover shadow-sm"
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-medium text-gray-700 mb-3">Информация о пользователе</h4>
                    {users[request.userId] ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Имя</p>
                          <p className="font-medium">{users[request.userId].name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{users[request.userId].email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Телефон</p>
                          <p className="font-medium">{users[request.userId].number || 'Не указан'}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">Данные пользователя не загружены</p>
                    )}
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={request.status}
                        onChange={(e) => updateRequestStatus(request.$id, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      <span className="ms-3 text-sm font-medium text-gray-700">
                        {request.status ? 'Одобрено' : 'Отклонить'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 w-full">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md overflow-hidden p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Административный доступ</h2>
          <p className="text-gray-600 mt-2">Введите пароль для входа в панель управления</p>
        </div>
        
        <form onSubmit={submitPassword} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Пароль
            </label>
            <input
              id="password"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите пароль"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Войти
          </button>
        </form>
      </div>
    </div>
  )
}

export default AdminPage