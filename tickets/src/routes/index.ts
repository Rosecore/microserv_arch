import express, { Request, Response } from 'express';
import { Screening } from '../models/screening';

const router = express.Router();

router.get('/api/tickets', async (req: Request, res: Response) => {
  const screenings = await Screening.find({});

  res.send(screenings);
});

export { router as indexScreeningRouter };
