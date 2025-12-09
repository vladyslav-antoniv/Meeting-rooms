import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  capacity: number;
  imageUrl?: string;
  ownerId: string;
  accessList: Record<string, 'admin' | 'user'>;
  createdAt: number;
}

export interface Booking {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  title: string;
  startTime: Timestamp;
  endTime: Timestamp;
}