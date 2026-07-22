import express, { Request, Response } from 'express';
import { NotFoundError } from '@anitix/shared';
import { Screening } from '../models/screening';

const router = express.Router();

router.get('/api/tickets/:id', async (req: Request, res: Response) => {
  const screening = await Screening.findById(req.params.id);

  if (!screening) {
    throw new NotFoundError();
  }

  res.send(screening);
});

export { router as showScreeningRouter };
