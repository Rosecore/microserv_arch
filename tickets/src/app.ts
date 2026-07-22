import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@anitix/shared';
import { createScreeningRouter } from './routes/new';
import { showScreeningRouter } from './routes/show';
import { indexScreeningRouter } from './routes/index';
import { updateScreeningRouter } from './routes/update';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);
app.use(currentUser);

app.use(createScreeningRouter);
app.use(showScreeningRouter);
app.use(indexScreeningRouter);
app.use(updateScreeningRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
