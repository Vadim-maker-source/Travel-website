import { useRef, useState } from 'react';
import { appwriteConfig, databases, storage } from '../../lib/appwrite/config';
import type { IHotel } from '../../types';
import { getCurrentUser } from '../../lib/appwrite/api';
import { COUNTRIES_LANG } from '../../consants/countries';

const SendRequest = () => {
  const [formData, setFormData] = useState<Omit<IHotel, '$id' | 'userId' | 'status'>>({
    name: '',
    description: '',
    type: 'medium',
    address: '',
    country: '',
    price: '',
    imageId: [],
  });
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files);
    if (images.length + newFiles.length > 15) {
      setError('Максимум 15 фоток, дегенерат!');
      return;
    }

    const updatedImages = [...images, ...newFiles];
    setImages(updatedImages);

    // Генерируем превьюхи
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);

    // Сбрасываем инпут, чтобы можно было добавить ещё
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviews = [...previews];
    URL.revokeObjectURL(newPreviews[index]); // Чистим память
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (images.length < 1) {
      setError('Ты че, фотки забыл, кретин?');
      setIsLoading(false);
      return;
    }

    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) throw new Error('Сначала залогинься, придурок!');

      // Загружаем фотки
      const uploadedImageIds = await Promise.all(
        images.map(async (image) => {
          const fileId = crypto.randomUUID();
          await storage.createFile(appwriteConfig.storageId, fileId, image);
          return fileId;
        })
      );

      // Отправляем заявку
      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.requestCollectionId,
        crypto.randomUUID(),
        {
          ...formData,
          imageId: uploadedImageIds,
          userId: currentUser.userId,
          status: false,
        }
      );

      setSuccess(true);
      setFormData({
        name: '',
        description: '',
        type: 'medium',
        address: '',
        country: '',
        price: '',
        imageId: [],
      });
      setImages([]);
      setPreviews([]);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Чёт не получилось, иди почини');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Submit Hotel Request</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Your request has been submitted successfully!
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Hotel Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Hotel Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
          >
            <option value="luxury">Luxury</option>
            <option value="medium">Medium</option>
            <option value="budget">Budget</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Country</label>
          <select
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
          >
            <option value="">Select country</option>
            {COUNTRIES_LANG.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Price (single room for 1 person per 1 day)</label>
          <input
            type="text"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Фотки (макс. 15)
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            ref={fileInputRef}
            className="mt-1 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100"
          />
          <p className="mt-1 text-sm text-gray-500">
            {images.length} фото выбрано (можно добавить ещё {15 - images.length})
          </p>
        </div>

        {previews.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${index}`}
                  className="w-full h-24 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SendRequest;