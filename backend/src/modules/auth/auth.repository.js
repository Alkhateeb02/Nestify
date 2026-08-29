import prisma from '../../config/prisma.js';
import { User } from '../../domain/entities/User.js';
import { Student } from '../../domain/entities/Student.js';
import { Landlord } from '../../domain/entities/Landlord.js';

export class AuthRepository {
  constructor(prismaClient = prisma) {
    this.prisma = prismaClient;
  }

  async createUser(userData) {
    const { password, role, ...rest } = userData;

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: rest.fullName || rest.name,
          email: rest.email,
          password_hash: password,
          phone_number: rest.phoneNumber || rest.phone_number || '0000000000',
          profile_image: rest.profile_image || null,
          role: role || 'student',
        },
      });


      if (role === 'student') {
        const studentData = await tx.student.create({
          data: {
            student_id: user.user_id,
            university_name: rest.university_name || 'TBD',
            major: rest.major || 'TBD',
            gender: rest.gender || 'TBD',
            academic_year: rest.academic_year || 'TBD',
          },
        });

        // Also create the student preferences record in student_preferences
        const sleepType = rest.sleepType || 'early';
        const smokingVal = rest.smoking || 'non-smoker';

        await tx.studentPreference.create({
          data: {
            student_id: user.user_id,
            sleep_schedule: sleepType,
            smoking_status: smokingVal,
            cleanliness_level: rest.cleanliness_level || 'moderate',
            noise_tolerance: rest.noise_tolerance || 'moderate',
            social_level: rest.social_level || 'ambivert',
            study_level: rest.study_level || 'flexible',
            guest_preference: rest.hostingStyle || 'sometimes',
          }
        });

        return { ...user, student: studentData, role };
      } else if (role === 'landlord') {
        const landlordData = await tx.landlord.create({
          data: {
            landlord_id: user.user_id,
            national_id: rest.nationalID || rest.national_id || `PENDING-${user.user_id}`,
            business_name: rest.businessName || rest.business_name || rest.fullName || rest.name,
            bank_name: rest.bankName || rest.bank_name || null,
            bank_account_holder_name: rest.bankAccountHolderName || rest.bank_account_holder_name || null,
          },
        });

        return { ...user, landlord: landlordData, role };
      }

      return { ...user, role };
    });

    return this._mapToDomain(result);
  }

  async findUserByEmail(email) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        student: true,
        landlord: true,
      },
    });

    if (!user) return null;
    return this._mapToDomain(user);
  }

  async findUserByPhone(phoneNumber) {
    const user = await this.prisma.user.findFirst({
      where: { phone_number: phoneNumber },
      include: {
        student: true,
        landlord: true,
      },
    });

    if (!user) return null;
    return this._mapToDomain(user);
  }

  async getUserById(id) {
    const user = await this.prisma.user.findUnique({
      where: { user_id: BigInt(id) },
      include: {
        student: true,
        landlord: true,
      },
    });

    if (!user) return null;
    return this._mapToDomain(user);
  }

  _mapToDomain(record) {
    const baseData = {
      userID: record.user_id.toString(),
      fullName: record.name,
      email: record.email,
      password: record.password_hash,
      phoneNumber: record.phone_number,
      isVerified: record.verified,
      profileImage: record.profile_image
    };

    if (record.student) {
      const student = new Student(baseData, {
        university: record.student.university_name,
        major: record.student.major,
        gender: record.student.gender,
        smokingStatus: record.student.smoking_status
      });
      student.role = 'student';
      return student;
    } else if (record.landlord) {
      const landlord = new Landlord(baseData, {
        nationalID: record.landlord.national_id,
        verificationStatus: record.landlord.verification_status,
        rating: record.landlord.rating ? parseFloat(record.landlord.rating) : 0
      });
      landlord.role = 'landlord';
      return landlord;
    } else {
      const user = new User(baseData);
      user.role = record.role || 'user';
      return user;
    }
  }


  // Token Store (Mocking the 'reset_tokens' table from Sequence Diagram 4.0.8)
  static resetTokens = new Map();

  async saveResetToken(userId, token, expiry) {
    // In a real scenario, this would be: await this.prisma.resetToken.create(...)
    AuthRepository.resetTokens.set(token, { user_id: userId, expiry, used: false });
    console.log(`DB Placeholder: Token ${token} saved for user ${userId}`);
  }

  async verifyResetToken(token) {
    // In a real scenario, this would be: await this.prisma.resetToken.findUnique(...)
    return AuthRepository.resetTokens.get(token);
  }

  async updatePassword(userId, hashedPassword) {
    await this.prisma.user.update({
      where: { user_id: BigInt(userId) },
      data: { password_hash: hashedPassword }
    });
  }

  async invalidateToken(token) {
    const data = AuthRepository.resetTokens.get(token);
    if (data) {
      data.used = true;
      AuthRepository.resetTokens.set(token, data);
    }
  }

  async setUserVerified(userId) {
    await this.prisma.user.update({
      where: { user_id: BigInt(userId) },
      data: { verified: true }
    });
  }


  static revokedTokens = new Set();

  async revokeToken(token, expiresAt) {
    AuthRepository.revokedTokens.add(token);
  }

  async isTokenRevoked(token) {
    return AuthRepository.revokedTokens.has(token);
  }
}


