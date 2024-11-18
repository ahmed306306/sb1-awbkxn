import { openDB } from 'idb';
import { User, Reservation, Room } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { rooms as initialRooms } from '../data/rooms';

const DB_NAME = 'RoomReservationDB';
const DB_VERSION = 3;

export const initDB = async () => {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        const userStore = db.createObjectStore('users', { keyPath: 'username' });
        userStore.createIndex('email', 'email', { unique: true });
        
        const reservationStore = db.createObjectStore('reservations', { keyPath: 'id' });
        reservationStore.createIndex('roomId', 'roomId');
        reservationStore.createIndex('userId', 'userId');
        reservationStore.createIndex('startTime', 'startTime');
      }
      
      if (oldVersion < 2) {
        const roomStore = db.createObjectStore('rooms', { keyPath: 'id' });
        roomStore.add(initialRooms[0]);
        roomStore.add(initialRooms[1]);
        roomStore.add(initialRooms[2]);
        roomStore.add(initialRooms[3]);
      }

      if (oldVersion < 3) {
        const resetCodesStore = db.createObjectStore('resetCodes', { keyPath: 'email' });
        resetCodesStore.createIndex('code', 'code');
        resetCodesStore.createIndex('expiry', 'expiry');
      }
    },
  });

  // Initialize admin user if not exists
  const adminUser = await db.get('users', 'admin');
  if (!adminUser) {
    await db.add('users', {
      username: 'admin',
      password: '12345678',
      email: 'admin@utopia.com',
      fullName: 'System Administrator',
      isAdmin: true
    });
  }

  return db;
};

export const addUser = async (user: User) => {
  const db = await initDB();
  const tx = db.transaction('users', 'readwrite');
  
  try {
    const existingUser = await tx.store.get(user.username);
    if (existingUser) {
      throw new Error('Username already exists');
    }
    
    const emailIndex = tx.store.index('email');
    const existingEmail = await emailIndex.get(user.email);
    if (existingEmail) {
      throw new Error('Email already exists');
    }
    
    await tx.store.add({ ...user, isAdmin: false });
    await tx.done;
  } catch (error) {
    await tx.abort();
    throw error;
  }
};

export const validateUser = async (username: string, password: string): Promise<User | null> => {
  const db = await initDB();
  const user = await db.get('users', username);
  
  if (user && user.password === password) {
    return user;
  }
  return null;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const db = await initDB();
  const tx = db.transaction('users', 'readonly');
  const emailIndex = tx.store.index('email');
  return emailIndex.get(email);
};

export const storeResetCode = async (email: string, code: string) => {
  const db = await initDB();
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 1);

  await db.put('resetCodes', {
    email,
    code,
    expiry: expiry.toISOString()
  });
};

export const verifyResetCode = async (email: string, code: string): Promise<boolean> => {
  const db = await initDB();
  const resetCode = await db.get('resetCodes', email);
  
  if (!resetCode) return false;
  if (resetCode.code !== code) return false;
  if (new Date(resetCode.expiry) < new Date()) return false;
  
  return true;
};

export const updatePassword = async (email: string, newPassword: string) => {
  const db = await initDB();
  const tx = db.transaction('users', 'readwrite');
  const emailIndex = tx.store.index('email');
  const user = await emailIndex.get(email);
  
  if (!user) throw new Error('User not found');
  
  user.password = newPassword;
  await tx.store.put(user);
  await tx.done;
  
  await db.delete('resetCodes', email);
};

export const getRooms = async () => {
  const db = await initDB();
  return db.getAll('rooms');
};

export const updateRoom = async (room: Room) => {
  const db = await initDB();
  await db.put('rooms', room);
};

export const addReservation = async (reservation: Omit<Reservation, 'id'>) => {
  const db = await initDB();
  const tx = db.transaction('reservations', 'readwrite');
  
  try {
    const existingReservations = await getReservationsByRoom(reservation.roomId);
    const hasConflict = existingReservations.some(existing => {
      const newStart = new Date(reservation.startTime);
      const newEnd = new Date(reservation.endTime);
      const existingStart = new Date(existing.startTime);
      const existingEnd = new Date(existing.endTime);
      
      return (newStart < existingEnd && newEnd > existingStart);
    });

    if (hasConflict) {
      throw new Error('Time slot is already booked');
    }

    const newReservation = {
      ...reservation,
      id: uuidv4(),
    };

    await tx.store.add(newReservation);
    await tx.done;
    return newReservation;
  } catch (error) {
    await tx.abort();
    throw error;
  }
};

export const getReservations = async () => {
  const db = await initDB();
  return db.getAll('reservations');
};

export const getReservationsByRoom = async (roomId: string) => {
  const db = await initDB();
  const tx = db.transaction('reservations', 'readonly');
  const index = tx.store.index('roomId');
  return index.getAll(roomId);
};

export const getReservationsByUser = async (userId: string) => {
  const db = await initDB();
  const tx = db.transaction('reservations', 'readonly');
  const index = tx.store.index('userId');
  return index.getAll(userId);
};

export const deleteReservation = async (id: string) => {
  const db = await initDB();
  await db.delete('reservations', id);
};