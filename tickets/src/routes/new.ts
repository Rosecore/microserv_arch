import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest } from '@anitix/shared';
import { Screening } from '../models/screening';
import { ScreeningCreatedPublisher } from '../events/publishers/screening-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
  '/api/tickets', // TODO(review): path still /api/tickets
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be greater than 0'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;

    const screening = Screening.build({
      title,
      price,
      userId: req.currentUser!.id,
    });
    await screening.save();
    new ScreeningCreatedPublisher(natsWrapper.client).publish({
      id: screening.id,
      title: screening.title,
      price: screening.price,
      userId: screening.userId,
      version: screening.version,
    });

    res.status(201).send(screening);
  }
);

export { router as createScreeningRouter };
