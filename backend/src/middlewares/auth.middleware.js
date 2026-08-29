import { verifyToken } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AuthRepository } from '../modules/auth/auth.repository.js';

const authRepo = new AuthRepository();

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ApiError(401, 'Not authorized to access this route'));
  }

  try {
    const decoded = verifyToken(token);
    
    // Check if token is revoked (server-side logout)
    const isRevoked = await authRepo.isTokenRevoked(token);
    if (isRevoked) {
      return next(new ApiError(401, 'Token has been revoked. Please log in again.'));
    }

    // Since we are mocking the DB, we just attach the decoded user info
    // In reality, you would fetch the user from the DB here
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT verification error:', err);
    return next(new ApiError(401, 'Not authorized to access this route'));
  }
});

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, `User role ${req.user.role} is not authorized to access this route`)
      );
    }
    next();
  };
};
