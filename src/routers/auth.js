import express from 'express';
import {validateBody} from '../middlewares/validateBody.js'
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { getMeController, loginUserController, logoutUserController, registerUserController } from '../controllers/auth.js';
import { loginUserSchema, registerUserSchema } from '../validation/auth.js';


const router = express();


router.post(
  '/register',
  validateBody(registerUserSchema),
ctrlWrapper(registerUserController))

router.post(
  '/login',
  validateBody(loginUserSchema),
  ctrlWrapper(loginUserController),
);

router.get('/me', ctrlWrapper(getMeController));


router.post('/logout', ctrlWrapper(logoutUserController));

export default router;