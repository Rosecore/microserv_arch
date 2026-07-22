import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  validateRequest,
  NotFoundError,
  requireAuth,
  NotAuthorizedError,
  BadRequestError,
} from '@anitix/shared';
import { Screening } from '../models/screening';
import { ScreeningUpdatedPublisher } from '../events/publishers/screening-updated-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put(
  '/api/tickets/:id',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be provided and must be greater than 0'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const screening = await Screening.findById(req.params.id);

    if (!screening) {
      throw new NotFoundError();
    }

    if (screening.orderId) {
      throw new BadRequestError('Cannot edit a reserved screening');
    }

    if (screening.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    screening.set({
      title: req.body.title,
      price: req.body.price,
    });
    await screening.save();
    new ScreeningUpdatedPublisher(natsWrapper.client).publish({
      id: screening.id,
      title: screening.title,
      price: screening.price,
      userId: screening.userId,
      version: screening.version,
    });

    res.send(screening);
  }
);

export { router as updateScreeningRouter };
