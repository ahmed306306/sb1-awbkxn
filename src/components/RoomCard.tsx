import React from 'react';
import { Users, Tv, MonitorCheck, Edit } from 'lucide-react';
import { Room, User } from '../types';

interface RoomCardProps {
  room: Room;
  onSelect: (room: Room) => void;
  onEdit?: (room: Room) => void;
  user?: User;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onSelect, onEdit, user }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="relative">
        <div className="h-48 overflow-hidden">
          <img 
            src={room.image} 
            alt={room.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
        {user?.isAdmin && onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(room);
            }}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
          >
            <Edit size={16} className="text-gray-600" />
          </button>
        )}
      </div>
      
      <div className="p-6" onClick={() => onSelect(room)}>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{room.name}</h3>
        <div className="flex items-center gap-2 text-gray-600 mb-2">
          <Users size={18} />
          <span>Capacity: {room.capacity}</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {room.equipment.map((item) => (
            <span 
              key={item}
              className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm flex items-center gap-1"
            >
              {item === 'TV' && <Tv size={14} />}
              {item === 'Video Conference' && <MonitorCheck size={14} />}
              {item}
            </span>
          ))}
        </div>
        {room.video && (
          <div className="mt-4">
            <video 
              controls 
              className="w-full rounded-lg"
              src={room.video}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        )}
      </div>
    </div>
  );
};