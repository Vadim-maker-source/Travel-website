import { FaCheckCircle, FaHome, FaInfoCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Success = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md overflow-hidden p-8 text-center">
        {/* Иконка успеха */}
        <div className="flex justify-center mb-6">
          <FaCheckCircle className="text-green-500 text-6xl" />
        </div>
        
        {/* Заголовок */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Бронирование успешно завершено!</h1>
        
        {/* Основной текст */}
        <p className="text-gray-600 mb-6">
          Спасибо за ваше бронирование. Мы отправили подтверждение на вашу электронную почту.
          Если у вас есть вопросы, пожалуйста, свяжитесь с нашей службой поддержки.
        </p>
        
        {/* Предупреждение о демо-версии */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 text-left">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaInfoCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Обратите внимание: это демонстрационный сайт. Настоящего бронирования не произошло.
                Все данные на этом сайте являются тестовыми и не приводят к реальным бронированиям.
              </p>
            </div>
          </div>
        </div>
        
        {/* Кнопки действий */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/')}
            className="flex cursor-pointer items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            <FaHome className="mr-2" />
            На главную
          </button>
          <button
            onClick={() => navigate('/my-trips')}
            className="cursor-pointer px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
          >
            Мои бронирования
          </button>
        </div>
      </div>
    </div>
  );
};

export default Success;