import { Request, Response, NextFunction } from 'express';
import { ReservationService } from '../services/reservation.service';

export const createReservation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { time, partySize, specialRequests } = req.body;
    const userId = req.user!.userId;
    
    const reservation = await ReservationService.createReservation(userId, time, partySize, specialRequests);
    res.status(201).json({ success: true, data: reservation });
  } catch (err) {
    next(err);
  }
};

export const getMyReservations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const reservations = await ReservationService.getUserReservations(userId);
    res.status(200).json({ success: true, data: reservations });
  } catch (err) {
    next(err);
  }
};

export const getAdminReservations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dateStr = req.query.date as string;
    const date = dateStr ? new Date(dateStr) : new Date();
    const reservations = await ReservationService.getAdminReservations(date);
    res.status(200).json({ success: true, data: reservations });
  } catch (err) {
    next(err);
  }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const reservation = await ReservationService.updateReservationStatus(id, status);
    res.status(200).json({ success: true, data: reservation });
  } catch (err) {
    next(err);
  }
};
