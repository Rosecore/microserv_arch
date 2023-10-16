import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { validateRequest } from '../middlewares/validate-request';
import { User } from '../models/user';
import { BadRequestError } from '../errors/bad-request-error';

const router = express.Router();

router.post(
  '/api/users/signup',
  [  body('email').isEmail().withMessage('Введите корректную почту'),
    body('password').trim().isLength({ min: 6, max: 12 }).withMessage('Пароль должен быть от 6 до 12')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError('Email in use');
    }
    const newuser = User.build({ email, password });
    await newuser.save();
    const newuserJwt = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      process.env.JWT_KEY!
    );
    req.session = {
      jwt: newuserJwt
    };
    res.status(201).send(user);
  }
);
export { router as signupRouter };
