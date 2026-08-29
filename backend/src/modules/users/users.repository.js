import prisma from '../../config/prisma.js';
import { User } from '../../domain/entities/User.js';
import { Student } from '../../domain/entities/Student.js';
import { Landlord } from '../../domain/entities/Landlord.js';

export class UserRepository {
  constructor(prismaClient = prisma) {
    this.prisma = prismaClient;
  }

  _mapToDomain(record) {
    if (!record) return null;

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
      student.year = record.student.academic_year;
      student.semester = record.student.academic_semester;
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

  async getUserById(id) {
    const userRecord = await this.prisma.user.findUnique({
      where: { user_id: BigInt(id) },
      include: { student: true, landlord: true }
    });

    return this._mapToDomain(userRecord);
  }

  async updateUser(id, data) {
    // Map Domain data back to DB fields
    const updateData = {};
    if (data.fullName) updateData.name = data.fullName;
    if (data.email) updateData.email = data.email;
    if (data.phoneNumber) updateData.phone_number = data.phoneNumber;
    if (data.profileImage !== undefined) updateData.profile_image = data.profileImage;
    if (data.password) updateData.password_hash = data.password;

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { user_id: BigInt(id) },
        data: updateData
      });

      const studentRecord = await tx.student.findUnique({
        where: { student_id: BigInt(id) }
      });

      if (studentRecord && (data.gender || data.major || data.year || data.semester !== undefined)) {
        const studentUpdate = {};
        if (data.gender) studentUpdate.gender = data.gender;
        if (data.major) studentUpdate.major = data.major;
        if (data.year) studentUpdate.academic_year = data.year;
        if (data.semester !== undefined) studentUpdate.academic_semester = data.semester;

        await tx.student.update({
          where: { student_id: BigInt(id) },
          data: studentUpdate
        });
      }

      const landlordRecord = await tx.landlord.findUnique({
        where: { landlord_id: BigInt(id) }
      });

      if (landlordRecord && (data.bankName !== undefined || data.bankAccountHolderName !== undefined)) {
        const landlordUpdate = {};
        if (data.bankName !== undefined) landlordUpdate.bank_name = data.bankName;
        if (data.bankAccountHolderName !== undefined) landlordUpdate.bank_account_holder_name = data.bankAccountHolderName;

        await tx.landlord.update({
          where: { landlord_id: BigInt(id) },
          data: landlordUpdate
        });
      }
    });

    const updatedRecord = await this.prisma.user.findUnique({
      where: { user_id: BigInt(id) },
      include: { student: true, landlord: true }
    });

    return this._mapToDomain(updatedRecord);
  }

  async getStudentPreferences(studentId) {
    const student = await this.prisma.student.findUnique({
      where: { student_id: BigInt(studentId) },
      include: { preferences: true }
    });
    return student; // contains university, major, gender, preferences, etc.
  }

  async updateStudentPreferences(studentId, prefs) {
    return await this.prisma.studentPreference.upsert({
      where: { student_id: BigInt(studentId) },
      update: {
        sleep_schedule: prefs.sleep_schedule,
        smoking_status: prefs.smoking_status,
        cleanliness_level: prefs.cleanliness_level !== undefined ? String(prefs.cleanliness_level) : undefined,
        noise_tolerance: prefs.noise_tolerance !== undefined ? String(prefs.noise_tolerance) : undefined,
        social_level: prefs.social_level !== undefined ? String(prefs.social_level) : undefined,
        study_level: prefs.study_level !== undefined ? String(prefs.study_level) : undefined,
        guest_preference: prefs.guest_preference,
      },
      create: {
        student_id: BigInt(studentId),
        sleep_schedule: prefs.sleep_schedule || 'early',
        smoking_status: prefs.smoking_status || 'non-smoker',
        cleanliness_level: prefs.cleanliness_level !== undefined ? String(prefs.cleanliness_level) : '3',
        noise_tolerance: prefs.noise_tolerance !== undefined ? String(prefs.noise_tolerance) : '3',
        social_level: prefs.social_level !== undefined ? String(prefs.social_level) : '3',
        study_level: prefs.study_level !== undefined ? String(prefs.study_level) : '3',
        guest_preference: prefs.guest_preference || 'sometimes',
      }
    });
  }

  async fetchPotentialCandidates(studentId) {
    const candidates = await this.prisma.student.findMany({
      where: {
        student_id: { not: BigInt(studentId) }
      },
      include: { 
        user: true, 
        preferences: true 
      }
    });
    return candidates;
  }
}


