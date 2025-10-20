import createHttpError from 'http-errors';
import {UserCollections} from '../db/models/user.js'
import {SessionsCollection} from '../db/models/session.js'
import bcrypt from 'bcrypt';
import { ONE_DAY, THIRTY_MIN, TWO_HOUR } from '../constants/index.js';
import { randomBytes } from 'crypto'; 


export const registerUser = async (payload) =>{
    const existingUser = await UserCollections.findOne({email:payload.email});
    if (existingUser) throw createHttpError(409,"Email in use");

    const encryptedPassword = await bcrypt.hash(payload.password,10);

    const user = await UserCollections.create({
        ...payload,
        password:encryptedPassword,
    });

    await SessionsCollection.deleteOne({userId:user._id});

const accessToken = randomBytes(30).toString('base64');
const refreshToken = randomBytes(30).toString('base64');

const session = await SessionsCollection.create({
    userId:user._id,
    accessToken,
    refreshToken,
     accessTokenValidUntil: new Date(Date.now() + THIRTY_MIN),
    refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
});
 return { user, session };
};


export const loginUser = async (payload) => {

  const user = await UserCollections.findOne({ email: payload.email });
  if (!user) {
    throw createHttpError(401, "User not found");
  }

  const isEqual = await bcrypt.compare(payload.password, user.password);
  if (!isEqual) {
    throw createHttpError(401, "Password incorrect");
  }


  await SessionsCollection.deleteOne({ userId: user._id });


  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');


  const sessionDoc = await SessionsCollection.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + THIRTY_MIN),
    refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
  });

  return {
    accessToken: sessionDoc.accessToken,
    refreshToken: sessionDoc.refreshToken,
    userId: sessionDoc.userId,
    _id: sessionDoc._id
  };
};


export const logoutUser = async (sessionId) => {
  await SessionsCollection.deleteOne({ _id: sessionId });
};

