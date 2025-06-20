export type INavLink = {
    imgURL: string;
    route: string;
    label: string;
};

export type IUser = {
    $id: string;
    userId: string;
    name: string;
    email: string;
    password: string;
    number: string;
}

export type HotelType = 'luxury' | 'budget' | 'medium';

export interface IRequest {
  $id?: string;
  hotelId: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
}

export interface IHotel {
  $id: string;
  $createdAt?: string;
  name: string;
  description: string;
  type: string;
  address: string;
  country: string;
  price: string; // Цена за 1 место за 1 день
  userId: string;
  imageId: string[];
  status: boolean;
  maxCapacity?: number; // Максимальное количество мест (по умолчанию 7)
}

export interface Booking {
  $id: string;
  $createdAt: string;
  hotelId: string;
  days: string;
  room: string; // Количество забронированных мест
  userId: string;
  calendar: string[];
  month: string[];
  totalPrice: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}