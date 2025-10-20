import createHttpError from "http-errors";
import { UserCollections } from "../db/models/user.js";
import { loginUser, logoutUser, registerUser } from "../services/auth.js";


const setupSession = (res, session) => {
  res.cookie('accessToken', session.accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 60 * 60 * 1000,
  });
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 15 * 24 * 60 * 60 * 1000, 
  });
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 15 * 24 * 60 * 60 * 1000, 
  });
};



export const registerUserController = async (req, res, next) => {
  try {
    const session = await registerUser(req.body);

    setupSession(res, session);

    res.status(201).json({
      data: {
        accessToken: session.session.accessToken,
        refreshToken: session.session.refreshToken,
        sessionId: session.session.userId,
      },
    });
  } catch (err) {
    console.error('❌ Registration error:', err);
    next(err);
  }
};


export const loginUserController = async (req, res, next) => {
  try {
    const session = await loginUser(req.body);
    setupSession(res, session);
    res.json({
      status: 200,
      message: 'Successfully logged in!',
      data: {
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        sessionId: session.userId,
      },
    });
  } catch (error) {
    next(error); 
  }
};


export const logoutUserController = async (req, res) => {
  if (req.cookies.sessionId) {
    await logoutUser(req.cookies.sessionId);
  }

  res.clearCookie('sessionId');
  res.clearCookie('refreshToken');
  res.clearCookie('accessToken');

  res.status(204).send();
};
