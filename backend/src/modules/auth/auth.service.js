import { hashPassword, comparePassword } from '../../utils/password.js';
import { generateToken, verifyToken } from '../../utils/jwt.js';

import jwt from 'jsonwebtoken';

import { ApiError } from '../../utils/ApiError.js';
import { emailService } from '../../utils/email.service.js';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class AuthService {
  constructor(authRepository) {
    this.authRepo = authRepository;
  }

  async registerUser(data) {
    const existingUser = await this.authRepo.findUserByEmail(data.email);
    if (existingUser) {
      throw new ApiError(400, 'User already exists');
    }

    const phone = data.phoneNumber || data.phone_number;
    if (phone) {
      const existingPhone = await this.authRepo.findUserByPhone(phone);
      if (existingPhone) {
        throw new ApiError(400, 'Phone number already registered');
      }
    }

    const hashedPassword = await hashPassword(data.password);
    
    const userToCreate = {
      ...data,
      password: hashedPassword,
      role: data.role || 'student',
    };

    const newUser = await this.authRepo.createUser(userToCreate);
    
    // Step: Send Real Verification Email (Activity Diagram 4.0.30)
    try {
      const verificationToken = generateToken({ id: newUser.userID, purpose: 'verification' });
      await emailService.sendVerificationEmail(newUser.email, newUser.fullName, verificationToken);
      console.log(`Verification email sent to ${newUser.email}`);
    } catch (error) {
      console.error('Email Error:', error);
      // We don't fail registration if email fails, but we log it
    }

    const token = generateToken({ id: newUser.userID, role: newUser.role });

    return { 
      user: { 
        id: newUser.userID, 
        name: newUser.fullName, 
        email: newUser.email, 
        role: newUser.role,
        phone_number: newUser.phoneNumber,
        gender: newUser.gender || null,
        major: newUser.major || null,
        year: newUser.year || null,
        profileImage: newUser.profileImage || null,
        bankName: newUser.bankName || null,
        bankAccountHolderName: newUser.bankAccountHolderName || null
      }, 
      token 
    };
  }

  async checkEmailExistence(email) {
    const existingUser = await this.authRepo.findUserByEmail(email);
    return !!existingUser;
  }

  async checkPhoneExistence(phoneNumber) {
    const existingUser = await this.authRepo.findUserByPhone(phoneNumber);
    return !!existingUser;
  }

  async loginUser(data) {
    const user = await this.authRepo.findUserByEmail(data.email);
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const isMatch = await comparePassword(data.password, user.password);
    const isPlainMatch = data.password === user.password;
    
    if (!isMatch && !isPlainMatch) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // Role check: If a specific role is requested, verify the user has it
    if (data.role && user.role !== data.role) {
      throw new ApiError(403, `This account is not authorized to log in as a ${data.role}`);
    }

    // Activity Diagram 4.0.30: Verify Authenticity Gate
    if (!user.isVerified) {
      throw new ApiError(403, 'Please verify your email address before logging in');
    }

    // Call domain entity method

    user.login();

    const token = generateToken({ id: user.userID, role: user.role });

    return { 
      user: { 
        id: user.userID, 
        name: user.fullName, 
        email: user.email, 
        role: user.role,
        phone_number: user.phoneNumber,
        gender: user.gender || null,
        major: user.major || null,
        year: user.year || null,
        profileImage: user.profileImage || null,
        bankName: user.bankName || null,
        bankAccountHolderName: user.bankAccountHolderName || null
      }, 
      token 
    };
  }

  async logoutUser(userId, token) {
    const user = await this.authRepo.getUserById(userId);
    if (user) {
      user.logout();
    }
    
    // Server-side revocation: Add token to blacklist
    try {
      const decoded = verifyToken(token);
      await this.authRepo.revokeToken(token, decoded.exp);
    } catch (error) {
      // If token is already expired or invalid, no need to revoke
    }
    
    return true;
  }

  async googleLogin(googleToken, requestedRole = 'student', extraData = {}) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: googleToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const { email, name, picture, sub: googleId } = payload;

      let user = await this.authRepo.findUserByEmail(email);

      if (!user) {
        // Create new user for Google Login
        user = await this.authRepo.createUser({
          email,
          fullName: name,
          profile_image: picture,
          role: requestedRole, // Dynamically assign requested role
          isVerified: true, // Google emails are already verified
          ...extraData, // Spread all questionnaire and lifestyle answers
        });
        
        // Mark as verified immediately since it's Google
        await this.authRepo.setUserVerified(user.userID);
        user.isVerified = true;
      }

      user.login();
      const token = generateToken({ id: user.userID, role: user.role });

      return {
        user: {
          id: user.userID,
          name: user.fullName,
          email: user.email,
          role: user.role,
          phone_number: user.phoneNumber,
          gender: user.gender || null,
          major: user.major || null,
          year: user.year || null,
          profileImage: user.profileImage || null,
          bankName: user.bankName || null,
          bankAccountHolderName: user.bankAccountHolderName || null
        },
        token
      };
    } catch (error) {
      console.error('Google Auth Error:', error);
      throw new ApiError(401, 'Invalid Google token');
    }
  }

  async forgotPassword(email) {
    const user = await this.authRepo.findUserByEmail(email);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    // Step: Generate unique reset token (as per Diagram 4.0.8)
    const resetToken = Math.random().toString(36).substring(2, 15);
    const expiry = new Date(Date.now() + 3600000); // 1 hour
    
    // Step: Save token to DB
    await this.authRepo.saveResetToken(user.userID, resetToken, expiry);
    
    // Step: Send Real Reset Email
    try {
      await emailService.sendPasswordResetEmail(email, resetToken);
    } catch (error) {
      console.error('Email Reset Error:', error);
    }
    
    return resetToken;
  }

  async resetPassword(token, newPassword) {
    // Step: Verify Token from DB
    const tokenData = await this.authRepo.verifyResetToken(token);
    if (!tokenData || tokenData.expiry < new Date() || tokenData.used) {
      throw new ApiError(400, 'Invalid or expired reset token');
    }
    
    // Step: Hash New Password
    const hashedPassword = await hashPassword(newPassword);
    
    // Step: Update Password in UserRepo
    await this.authRepo.updatePassword(tokenData.user_id, hashedPassword);
    
    // Step: Invalidate used token
    await this.authRepo.invalidateToken(token);
    
    return true;
  }

  async verifyEmail(token) {
    try {
      const decoded = verifyToken(token);
      if (decoded.purpose !== 'verification') {
        throw new ApiError(400, 'Invalid verification token');
      }
      
      const user = await this.authRepo.getUserById(decoded.id);
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      // If already verified, just return success
      if (user.isVerified) {
        return true;
      }

      await this.authRepo.setUserVerified(decoded.id);
      return true;
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      throw new ApiError(400, error.message || 'Invalid or expired verification token');
    }
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await this.authRepo.getUserById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const isMatch = await comparePassword(currentPassword, user.password);
    const isPlainMatch = currentPassword === user.password;
    if (!isMatch && !isPlainMatch) {
      throw new ApiError(400, 'Incorrect current password');
    }

    const hashedPassword = await hashPassword(newPassword);
    await this.authRepo.updatePassword(userId, hashedPassword);
    return true;
  }


}


