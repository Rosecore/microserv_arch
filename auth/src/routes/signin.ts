import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { Password } from '../services/password';
import { User } from '../models/user';
import { validateRequest } from '../middlewares/validate-request';
import { BadRequestError } from '../errors/bad-request-error';

var router = express.Router();
router.post(
  '/api/users/signin',
  [
    body('email')
      .isEmail()
      .withMessage('Нужна почта'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('Нужен пароль')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    var { email, password } = req.body;
    var existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new BadRequestError('Invalid credentials');
    }
    var passwordsMatch = await Password.compare(
      existingUser.password,
      password
    );
    // TODO(review): removed dead/broken admin-check block (referenced an undefined
    // `adminUser` and never influenced the response) — pre-existing bug found while
    // fixing the toolchain build; not part of any admin feature that currently works.
    if (!passwordsMatch) {
      throw new BadRequestError('Invalid Credentials');
    }
    var userJwt = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email
      },
      process.env.JWT_KEY!
    );
    req.session = {
      jwt: userJwt
    };
    res.status(200).send(existingUser);
  }
);
export { router as signinRouter };
