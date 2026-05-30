import { prisma } from '../lib/prisma';
import { AppError } from '../errors/AppError';
import { env } from '../lib/env';

// Environment capacity, default 50
const MAX_CAPACITY_PER_SLOT = parseInt(env.MAX_CAPACITY_PER_SLOT || '50', 10);

export class ReservationService {
  /**
   * Creates a reservation ensuring the slot capacity is not exceeded.
   * Utilizes PostgreSQL Serializable transactions to prevent overbooking
   * under high concurrency.
   */
  static async createReservation(userId: string, requestedTime: string, partySize: number, specialRequests?: string) {
    if (partySize < 1) throw new AppError('Party size must be at least 1', 400, 'INVALID_INPUT');

    const reservationTime = new Date(requestedTime);
    if (isNaN(reservationTime.getTime())) {
      throw new AppError('Invalid reservation time', 400, 'INVALID_INPUT');
    }

    // 1. Enforce Fixed Slot Model (e.g. top of the hour only)
    if (reservationTime.getMinutes() !== 0 || reservationTime.getSeconds() !== 0) {
      throw new AppError('Reservations can only be made for top-of-hour slots (e.g., 6:00 PM, 7:00 PM)', 400, 'INVALID_SLOT');
    }

    if (reservationTime < new Date()) {
      throw new AppError('Cannot book in the past', 400, 'INVALID_SLOT');
    }

    try {
      // 2. Serializable Transaction
      return await prisma.$transaction(async (tx) => {
        // Find existing confirmed reservations for this exact slot
        const existingReservations = await tx.reservation.findMany({
          where: {
            reservationTime: reservationTime,
            status: { in: ['CONFIRMED'] }
          }
        });

        const currentBookedSeats = existingReservations.reduce((sum, res) => sum + res.partySize, 0);

        if (currentBookedSeats + partySize > MAX_CAPACITY_PER_SLOT) {
          throw new AppError('Slot is fully booked', 409, 'CAPACITY_EXCEEDED');
        }

        // Capacity is available, create the reservation
        return await tx.reservation.create({
          data: {
            userId,
            reservationTime,
            partySize,
            specialRequests,
            status: 'CONFIRMED' // Auto-confirmed in V1 if capacity exists
          }
        });
      }, {
        isolationLevel: 'Serializable'
      });
    } catch (err: any) {
      // 3. Handle P2034 Serializable Transaction Abort
      if (err.code === 'P2034') {
        // Prisma serializable error: "Transaction failed due to a write conflict or a deadlock. Please retry your transaction"
        // We explicitly map this to a 409 Conflict, informing the client to retry or pick a new slot.
        throw new AppError('Slot was just booked by someone else. Please try another slot.', 409, 'CONCURRENCY_CONFLICT');
      }
      throw err;
    }
  }

  static async getUserReservations(userId: string) {
    return prisma.reservation.findMany({
      where: { userId },
      orderBy: { reservationTime: 'desc' }
    });
  }

  static async getAdminReservations(date: Date) {
    // Get all reservations for the given calendar date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return prisma.reservation.findMany({
      where: {
        reservationTime: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: { user: { select: { email: true, id: true } } },
      orderBy: { reservationTime: 'asc' }
    });
  }

  static async updateReservationStatus(id: string, status: any) {
    const res = await prisma.reservation.findUnique({ where: { id } });
    if (!res) throw new AppError('Reservation not found', 404, 'NOT_FOUND');
    
    return prisma.reservation.update({
      where: { id },
      data: { status }
    });
  }
}
