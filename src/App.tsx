import React, { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { rooms } from './data/rooms';
import { DisplayView } from './components/DisplayView';
import { AuthForms } from './components/AuthForms';
import { User } from './types';
import { ReservationSystem } from './components/ReservationSystem';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isDisplayView, setIsDisplayView] = useState(false);

  if (!user && !isDisplayView) {
    return (
      <div className="bg-red-50">
        <div className="fixed top-4 right-4">
          <button
            onClick={() => setIsDisplayView(true)}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
          >
            Display View
          </button>
        </div>
        <AuthForms onLogin={setUser} />
      </div>
    );
  }

  if (isDisplayView) {
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
                <Clock className="h-5 w-5 text-gray-600" />
                <span className="text-xl font-semibold text-gray-600">
                  {new Date().toLocaleTimeString()}
                </span>
                <button
                  onClick={() => setIsDisplayView(false)}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                >
                  Booking System
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DisplayView rooms={rooms} />
        </main>
      </div>
    );
  }

  return <ReservationSystem user={user} onLogout={() => setUser(null)} />;
}

export default App;