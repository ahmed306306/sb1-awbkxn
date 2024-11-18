import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Room, Reservation } from '../types';
import { getReservations } from '../utils/db';

interface DisplayViewProps {
  rooms: Room[];
}

export const DisplayView: React.FC<DisplayViewProps> = ({ rooms }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    const loadReservations = async () => {
      const allReservations = await getReservations();
      setReservations(allReservations);
    };
    loadReservations();

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getCurrentMeeting = (roomId: string) => {
    return reservations.find(res => {
      const start = new Date(res.startTime);
      const end = new Date(res.endTime);
      return res.roomId === roomId && 
             currentTime >= start && 
             currentTime <= end;
    });
  };

  const getNextMeeting = (roomId: string) => {
    const futureReservations = reservations
      .filter(res => {
        const start = new Date(res.startTime);
        return res.roomId === roomId && start > currentTime;
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    
    return futureReservations[0];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {rooms.map(room => {
        const currentMeeting = getCurrentMeeting(room.id);
        const nextMeeting = getNextMeeting(room.id);

        return (
          <div key={room.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{room.name}</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Current Status</h3>
                  {currentMeeting ? (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-xl font-bold text-blue-900 mb-2">{currentMeeting.title}</p>
                      <p className="text-sm text-blue-700">
                        {format(new Date(currentMeeting.startTime), 'HH:mm')} - {format(new Date(currentMeeting.endTime), 'HH:mm')}
                      </p>
                      <p className="text-sm text-blue-700 mt-1">Organizer: {currentMeeting.organizer}</p>
                    </div>
                  ) : (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-lg font-medium text-green-700">Available</p>
                    </div>
                  )}
                </div>

                {nextMeeting && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Next Meeting</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium text-gray-900">{nextMeeting.title}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {format(new Date(nextMeeting.startTime), 'HH:mm')} - {format(new Date(nextMeeting.endTime), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};