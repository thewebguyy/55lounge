import { ReservationService } from './services/reservation.service';
import { prisma } from './lib/prisma';
import { AppError } from './errors/AppError';

// Ensure the capacity limit is matched to the test
jest.mock('./lib/env', () => ({
  env: {
    MAX_CAPACITY_PER_SLOT: '50'
  }
}));

// We'll mock prisma.$transaction since unit testing serializable transactions 
// on a live DB inside jest can be flaky without proper setup, but we'll 
// simulate the logic the service expects.
describe('ReservationService Concurrency', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createReservation', () => {
    it('should reject non-top-of-hour slots', async () => {
      const futureTime = new Date();
      futureTime.setHours(futureTime.getHours() + 1);
      futureTime.setMinutes(15); // Not top of hour

      await expect(
        ReservationService.createReservation('user-1', futureTime.toISOString(), 2)
      ).rejects.toThrow(AppError);
    });

    it('should translate Prisma P2034 into 409 CONCURRENCY_CONFLICT', async () => {
      const topOfHour = new Date();
      topOfHour.setHours(topOfHour.getHours() + 1, 0, 0, 0);

      const mockPrismaError = new Error('Prisma error');
      (mockPrismaError as any).code = 'P2034';

      jest.spyOn(prisma, '$transaction').mockRejectedValueOnce(mockPrismaError);

      await expect(
        ReservationService.createReservation('user-1', topOfHour.toISOString(), 2)
      ).rejects.toMatchObject({
        statusCode: 409,
        code: 'CONCURRENCY_CONFLICT'
      });
    });

    // Note: A true concurrent integration test (e.g. Promise.all) is best run against
    // a real Postgres instance with `jest --runInBand=false`.
    // We will simulate the transaction closure here to verify the capacity summation.
    it('should reject if party size exceeds remaining capacity in the slot', async () => {
      const topOfHour = new Date();
      topOfHour.setHours(topOfHour.getHours() + 1, 0, 0, 0);

      // Simulate $transaction calling our callback
      jest.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
        return callback({
          reservation: {
            findMany: jest.fn().mockResolvedValue([
              { partySize: 40 } // 40 seats already booked
            ]),
            create: jest.fn()
          }
        });
      });

      // Try to book 15 seats (40 + 15 = 55 > 50)
      await expect(
        ReservationService.createReservation('user-1', topOfHour.toISOString(), 15)
      ).rejects.toMatchObject({
        statusCode: 409,
        code: 'CAPACITY_EXCEEDED'
      });
    });
  });
});
