import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

import { verifyToken } from '@/utils/token'
import Token from '@/utils/interfaces/token.interface'
import HttpException from '@/utils/exceptions/http.exception'

import UserModel from '@/resources/user/user.model'


async function authenticatedMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  const bearer = req.headers.authorization

  if (!bearer || !bearer.startsWith('Bearer ')) {
    return next(new HttpException(401, 'Unauthorized'))
  }

  const accessToken = bearer.split(' ')[1]

  try {
    const payload: Token | jwt.JsonWebTokenError = await verifyToken(accessToken)

    if (payload instanceof jwt.JsonWebTokenError) {
      return next(new HttpException(401, 'Unauthorized'))
    }

    const user = await UserModel.findById(payload.id)
      .select('-password')
    
    if (!user) {
      return next(new HttpException(401, 'Unauthorized'))
    }

    req.user = user

    next()

  } catch (error) {
    return next(new HttpException(401, 'Unauthorized'))
  }
}

export default authenticatedMiddleware