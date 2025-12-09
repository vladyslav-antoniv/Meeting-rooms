import { type Booking } from '../types';
import { isBefore, isAfter } from 'date-fns';

export const checkOverlap = (
  newStart: Date,
  newEnd: Date,
  existingBookings: Booking[]
): boolean => {
  return existingBookings.some((booking) => {
    const existingStart = booking.startTime.toDate();
    const existingEnd = booking.endTime.toDate();

    return (
      isBefore(newStart, existingEnd) && 
      isAfter(newEnd, existingStart)
    );
  });
};