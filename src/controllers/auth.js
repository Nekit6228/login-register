import createHttpError from "http-errors";
import { UserCollections } from "../db/models/user.js";
import { loginUser, logoutUser, registerUser } from "../services/auth.js";
import { SessionsCollection } from "../db/models/session.js";


const setupSession = (res, session) => {
  const isProd = process.env.NODE_ENV === 'production';

  res.cookie('accessToken', session.accessToken, {
    httpOnly: true,
    secure: isProd,           
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
    maxAge: 60 * 60 * 1000,
  });

  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
    maxAge: 15 * 24 * 60 * 60 * 1000,
  });

  res.cookie('sessionId', session._id, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
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


export const getMeController = async (req, res, next) => {
  try {
    const { sessionId } = req.cookies;

    if (!sessionId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const session = await SessionsCollection.findById(sessionId);
    if (!session) {
      return res.status(401).json({ message: 'Invalid session' });
    }

    if (session.accessTokenValidUntil < new Date()) {
      await SessionsCollection.deleteOne({ _id: sessionId });
      return res.status(401).json({ message: 'Session expired' });
    }

    const user = await UserCollections.findById(session.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      email: user.email,
      user: {
        id: user._id,
        email: user.email,
      },
      session: {
        id: session._id,
        expiresAt: session.accessTokenValidUntil,
      },
    });
  } catch (err) {
    next(err);
  }
};
