export interface Room {
  id: string;
  name: string;
  capacity: number;
  equipment: string[];
  image: string;
  video?: string;
}

export interface User {
  username: string;
  password: string;
  email: string;
  fullName: string;
  isAdmin: boolean;
}

export interface Reservation {
  id: string;
  roomId: string;
  userId: string;
  title: string;
  organizer: string;
  startTime: string;
  endTime: string;
  attendees: number;
}