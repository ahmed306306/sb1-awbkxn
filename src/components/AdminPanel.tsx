import React, { useState } from 'react';
import { Room } from '../types';
import { updateRoom } from '../utils/db';
import { X } from 'lucide-react';

interface AdminPanelProps {
  room: Room;
  onClose: () => void;
  onUpdate: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ room, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    image: room.image,
    video: room.video || '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateRoom({
        ...room,
        ...formData
      });
      onUpdate();
      onClose();
    } catch (err) {
      setError('Failed to update room');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-semibold mb-6">Edit Room: {room.name}</h2>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              type="url"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Video URL (Optional)
            </label>
            <input
              type="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              value={formData.video}
              onChange={(e) => setFormData({ ...formData, video: e.target.value })}
              placeholder="https://example.com/video.mp4"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors duration-200"
          >
            Update Room
          </button>
        </form>
      </div>
    </div>
  );
};