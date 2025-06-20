import { NavLink, useLocation, useNavigate } from "react-router-dom";
import type { IRequest } from "../../types";
import { sidebarLinks } from "../../consants/route";
import { useEffect, useState } from "react";
import { getCurrentUser, logout } from "../../lib/appwrite/api";
import { appwriteConfig, databases } from "../../lib/appwrite/config";
import { Query } from "appwrite";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHotel, faUserTie } from "@fortawesome/free-solid-svg-icons";

interface Hotel {
  $id: string;
  userId: string;
  status: boolean;
}

const Leftbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pendingBookingsCount, setPendingBookingsCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [userHotels, setUserHotels] = useState<Hotel[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        
        if (currentUser) {
          // Получаем отели пользователя
          const hotelsResponse = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.tripCollectionId,
            [
              Query.equal('userId', currentUser.$id),
              Query.equal('status', true)
            ]
          );
          
          const hotels = hotelsResponse.documents as unknown as Hotel[];
          setUserHotels(hotels);

          // Получаем бронирования со статусом pending
          if (hotels.length > 0) {
            const bookingsResponse = await databases.listDocuments(
              appwriteConfig.databaseId,
              appwriteConfig.bookingCollectionId,
              [
                Query.equal('status', 'pending'),
                Query.equal('hotelId', hotels.map(h => h.$id))
              ]
            );
            
            setPendingBookingsCount(bookingsResponse.total);
          }

          const requestsResponse = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.requestCollectionId,
          );

          const requests = requestsResponse.documents as unknown as IRequest[];

          if (requests.length > 0) {
            const requestResponse = await databases.listDocuments(
              appwriteConfig.databaseId,
              appwriteConfig.requestCollectionId,
              [
                Query.equal('status', false)
              ]
            );
            
            setPendingRequestsCount(requestResponse.total);
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      navigate('/sign-in');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Используем startsWith для проверки пути
  const isMyHotels = pathname.startsWith('/my-hotels');
  const isAdmin = pathname === import.meta.env.VITE_APPWRITE_ADMIN_PAGE;
  const isDocs = pathname === '/docs';

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="w-64 bg-white h-screen border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">Logo</h1>
      </div>

      {/* Navigation Links */}
      <ul className='flex flex-col gap-1 flex-grow p-2'>
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.route;
          return (
            <li key={link.label}>
              <NavLink 
                to={link.route} 
                className={`flex items-center p-3 rounded-md ${isActive ? 'bg-blue-500 text-white font-medium' : 'text-gray-700'}`}
              >
                <span className="ml-2">{link.imgURL}&nbsp; {link.label}</span>
              </NavLink>
            </li>
          );
        })}
        
        {/* Ссылка на управление отелями (только если есть одобренные отели) */}
        {userHotels.length > 0 && (
          <li>
            <NavLink 
              to={`/my-hotels/${user.$id}`} 
              className={`flex items-center p-3 rounded-md ${isMyHotels ? 'bg-blue-500 text-white font-medium' : 'text-gray-700'}`}
            >
              <span className="ml-2"><FontAwesomeIcon icon={faHotel} />&nbsp; Мои отели</span>
              {pendingBookingsCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {pendingBookingsCount}
                </span>
              )}
            </NavLink>
          </li>
        )}

        {user?.$id === '6847074400114bb73cd4' && (
          <li>
            <NavLink 
              to={import.meta.env.VITE_APPWRITE_ADMIN_PAGE} 
              className={`flex items-center p-3 rounded-md ${isAdmin ? 'bg-blue-500 text-white font-medium' : 'text-gray-700'}`}
            >
              <span className="ml-2"><FontAwesomeIcon icon={faUserTie} />&nbsp; Админка</span>
              {pendingRequestsCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {pendingRequestsCount}
                </span>
              )}
            </NavLink>
          </li>
        )}
      </ul>

      <div className="p-2">
        <NavLink 
          to={`/docs`} 
          className={`flex items-center p-3 rounded-md hover:bg-gray-100 ${isDocs ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'} relative mb-2`}
        >
          <span className="ml-2">Документация</span>
        </NavLink>
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        {user ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <p className="font-medium">{user.name}</p>
                <p className="text-gray-400 text-sm">{user.email}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded hover:bg-gray-200 transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => navigate('/sign-in')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/sign-up')}
              className="w-full bg-white border border-blue-600 text-blue-600 py-2 px-4 rounded hover:bg-blue-50 transition"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leftbar;