import { ID, Query } from "appwrite";
import type { IUser } from "../../types";
import { account, appwriteConfig, databases } from "./config";

export async function SignUp (user: IUser) {
    try {
        const newAccount = await account.create(
            ID.unique(),
            user.email,
            user.password,
            user.name
        );
      
        if (!newAccount) throw Error;

        const newUser = {
            $id: newAccount.$id,
            userId: newAccount.$id,
            name: newAccount.name,
            email: newAccount.email,
            password: user.password,
            number: user.number
        };
    
        await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            newUser
        );
        
        return await account.createEmailPasswordSession(user.email, user.password);
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function SignIn (email: string, password: string) {
    try {
        const session = await account.createEmailPasswordSession(email,password);
        
        return session;
    } catch (error) {
        console.log(error)
    }
}

export async function getCurrentUser(): Promise<IUser | null> {
    try {
        const currentAccount = await account.get();
        if (!currentAccount) return null;
    
        const userDocs = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('userId', currentAccount.$id)]
        );

        if (userDocs.documents.length === 0) return null;
        
        const userDoc = userDocs.documents[0];
        
        return {
            $id: userDoc.$id,
            userId: userDoc.$id,
            name: userDoc.name,
            email: userDoc.email,
            password: userDoc.password,
            number: userDoc.number
        };
    } catch (error) {
        console.log(error);
        return null;
    }
}

export const getUserById = async (userId: string): Promise<IUser | null> => {
    try {
        console.log('Fetching user with ID:', userId);
        
        if (!userId) throw new Error('User ID is required');
        
        const userDocs = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('userId', userId)]
        );
  
        if (userDocs.documents.length > 0) {
            const userData = userDocs.documents[0];
            return {
                $id: userData.$id,
                userId: userData.userId,
                name: userData.name,
                email: userData.email,
                password: userData.password,
                number: userData.number
            };
        }
  
        // If not found by userId, try by document ID (backward compatibility)
        try {
            const userData = await databases.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                userId
            );
            
            return {
                $id: userData.$id,
                userId: userData.userId || userData.$id,
                name: userData.name,
                email: userData.email,
                password: userData.password,
                number: userData.number
            };
        } catch (e) {
            return null;
        }
    } catch (error) {
        console.error('Failed to get user:', error);
        return null;
    }
  };

export const logout = async (): Promise<void> => {
  try {
    await account.deleteSession("current");
  } catch (error) {
    console.error("Ошибка выхода, идиот:", error);
    throw new Error("Не удалось выйти, ты даже это не можешь сделать нормально");
  }
};
  
export const getUserBookings = async (userId: string) => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.bookingCollectionId,
      [Query.equal('userId', userId)]
    );

    return response.documents;
  } catch (error) {
    console.error('Ошибка при получении поездок:', error);
    return [];
  }
};

export const getUserTripsWithDetails = async (userId: string) => {
    /* 1. Берём все бронирования пользователя */
    const { documents: bookings } = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.bookingCollectionId,
      [Query.equal('userId', userId)]
    );
  
    if (bookings.length === 0) return [];
  
    /* 2. Один запрос на каждую уникальную tripId */
    const uniqueTripIds = [...new Set(bookings.map((b: any) => b.$id))];
  
    const tripDocs = await Promise.all(
      uniqueTripIds.map(id =>
        databases
          .getDocument(appwriteConfig.databaseId, appwriteConfig.tripCollectionId, id)
          .catch(() => null)            // если поездка удалена
      )
    );
  
    /* 3. Карта: tripId -> данные поездки */
    const tripMap = new Map<string, any>();
    tripDocs.forEach(doc => {
      if (doc) tripMap.set(doc.$id, doc);
    });
  
    /* 4. Склеиваем бронирование + данные поездки */
    return bookings.map((b: any) => {
      const trip = tripMap.get(b.$id) || {};
      return {
        ...b,
        // поля из trip‑документа
        name: trip.name ?? 'Без названия',
        country: trip.country ?? 'Не указана страна',
        price: trip.price ?? '',
        imageId: trip.imageId ?? [],
        type: trip.type ?? 'medium',
      };
    });
  };

export const getTripById = async (tripId: string) => {
  const response = await databases.getDocument(
    appwriteConfig.databaseId,
    appwriteConfig.tripCollectionId,
    tripId
  );
  return response;
};