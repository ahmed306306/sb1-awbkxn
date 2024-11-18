import React, { useState, useEffect } from 'react';
import { User, Room, Reservation } from '../types';
import { RoomCard } from './RoomCard';
import { ReservationForm } from './ReservationForm';
import { AdminPanel } from './AdminPanel';
import { getReservationsByUser, deleteReservation, getRooms, addReservation } from '../utils/db';
import { LogOut, Calendar } from 'lucide-react';

interface ReservationSystemProps {
  user: User;
  onLogout: () => void;
}

export const ReservationSystem: React.FC<ReservationSystemProps> = ({ user, onLogout }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [userReservations, setUserReservations] = useState<Reservation[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRooms();
    loadUserReservations();
  }, [user.username]);

  const loadRooms = async () => {
    try {
      const loadedRooms = await getRooms();
      setRooms(loadedRooms);
    } catch (err) {
      setError('Failed to load rooms');
    }
  };

  const loadUserReservations = async () => {
    try {
      const reservations = await getReservationsByUser(user.username);
      setUserReservations(reservations);
    } catch (err) {
      setError('Failed to load reservations');
    }
  };

  const handleReservationSubmit = async (formData: any) => {
    try {
      await addReservation({
        ...formData,
        userId: user.username,
      });
      setSelectedRoom(null);
      loadUserReservations();
    } catch (err: any) {
      setError(err.message || 'Failed to create reservation');
    }
  };

  const handleDeleteReservation = async (id: string) => {
    try {
      await deleteReservation(id);
      loadUserReservations();
    } catch (err) {
      setError('Failed to delete reservation');
    }
  };

  return (
    <div className="min-h-screen bg-red-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-red-600" />
              <h1 className="ml-3 text-2xl font-bold text-gray-900">Utopia Pharmaceutical</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                Welcome, {user.fullName} {user.isAdmin ? '(Admin)' : ''}
              </span>
              <button
                onClick={onLogout}
                className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Reservations</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {userReservations.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userReservations.map((reservation) => {
                    const room = rooms.find(r => r.id === reservation.roomId);
                    return (
                      <tr key={reservation.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {room?.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {reservation.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(reservation.startTime).toLocaleString()} - {new Date(reservation.endTime).toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => handleDeleteReservation(reservation.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="p-6 text-gray-500">No reservations found</p>
            )}
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">Available Rooms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              user={user}
              onSelect={() => setSelectedRoom(room)}
              onEdit={user.isAdmin ? (room) => setEditingRoom(room) : undefined}
            />
          ))}
        </div>
      </main>

      {selectedRoom && (
        <ReservationForm
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
          onSubmit={handleReservationSubmit}
        />
      )}

      {editingRoom && (
        <AdminPanel
          room={editingRoom}
          onClose={() => setEditingRoom(null)}
          onUpdate={loadRooms}
        />
      )}
    </div>
  );
};