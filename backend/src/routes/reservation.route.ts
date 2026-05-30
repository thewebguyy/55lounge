import { Router } from 'express';
import * as reservationController from '../controllers/reservation.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

router.post('/', reservationController.createReservation);
router.get('/my-reservations', reservationController.getMyReservations);

export default router;
