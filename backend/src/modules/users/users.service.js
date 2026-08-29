import { ApiError } from '../../utils/ApiError.js';
import { config } from '../../config/env.js';

const AI_BASE_URL = config.aiBaseUrl;

const mapPrefToNum = (val, defaultVal = 3) => {
  if (!val) return defaultVal;
  const num = parseInt(val);
  if (!isNaN(num)) return num;

  const norm = val.toLowerCase().trim();
  if (norm.includes('high') || norm.includes('clean') || norm.includes('loud') || norm.includes('extrovert') || norm.includes('focused') || norm.includes('intensive') || norm.includes('very')) {
    return 5;
  }
  if (norm.includes('low') || norm.includes('messy') || norm.includes('quiet') || norm.includes('introvert') || norm.includes('relaxed') || norm.includes('chill') || norm.includes('rarely')) {
    return 1;
  }
  return defaultVal;
};

export class UserService {
  constructor(userRepository) {
    this.userRepo = userRepository;
  }

  async updateProfile(id, data) {
    const user = await this.userRepo.getUserById(id);
    if (!user) throw new ApiError(404, 'User not found');
    
    // Map DTO to Domain Entity properties
    const updateData = {};
    if (data.fullName) updateData.fullName = data.fullName;
    if (data.phoneNumber) updateData.phoneNumber = data.phoneNumber;
    if (data.profile_image !== undefined) updateData.profileImage = data.profile_image;
    if (data.gender) updateData.gender = data.gender;
    if (data.major) updateData.major = data.major;
    if (data.year) updateData.year = data.year;
    if (data.semester !== undefined) updateData.semester = data.semester;
    if (data.bankName !== undefined) updateData.bankName = data.bankName;
    if (data.bankAccountHolderName !== undefined) updateData.bankAccountHolderName = data.bankAccountHolderName;
    if (data.password) {
      const { hashPassword } = await import('../../utils/password.js');
      updateData.password = await hashPassword(data.password);
    }
    
    // Utilize Domain Entity method
    user.updateProfile(updateData);

    // Persist changes
    return await this.userRepo.updateUser(id, user);
  }

  async getPreferences(studentId) {
    const student = await this.userRepo.getStudentPreferences(studentId);
    if (!student) throw new ApiError(404, 'Student profile not found');
    return mapDbPreferencesToUi(student.preferences);
  }

  async updatePreferences(studentId, data) {
    const dbPrefs = mapStringPreferencesToDb(data);
    const updated = await this.userRepo.updateStudentPreferences(studentId, dbPrefs);

    try {
      const student = await this.userRepo.getStudentPreferences(studentId);
      if (student && student.preferences) {
        const sleepVal = student.preferences.sleep_schedule?.toLowerCase() || 'early';
        const smokeVal = student.preferences.smoking_status?.toLowerCase() || 'no';

        const payload = {
          sleep: (sleepVal === 'night_owl' || sleepVal === 'late' || sleepVal === 'night') ? 'late' : 'early',
          smoke: (smokeVal === 'smoker' || smokeVal === 'yes') ? 'yes' : 'no',
          clean: mapPrefToNum(student.preferences.cleanliness_level, 4),
          noise: mapPrefToNum(student.preferences.noise_tolerance, 2),
          social: mapPrefToNum(student.preferences.social_level, 3),
          budget: 150,
          pets_allowed: false,
          study: mapPrefToNum(student.preferences.study_level, 4)
        };

        const response = await fetch(`${AI_BASE_URL}/ai/vector`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const json = await response.json();
          if (json.success && json.data && json.data.vector) {
            const vectorStr = JSON.stringify(json.data.vector);
            await this.userRepo.prisma.student.update({
              where: { student_id: BigInt(studentId) },
              data: { vector_value: vectorStr }
            });
          }
        }
      }
    } catch (err) {
      console.error('Failed to recalculate and store student vector during updatePreferences:', err);
    }

    return mapDbPreferencesToUi(updated);
  }
}

function mapStringPreferencesToDb(data) {
  const result = {};

  // sleep schedule
  const sleep = data.sleepSchedule || data.sleepType || data.sleep_schedule;
  if (sleep) {
    if (['early_sleeper', 'early'].includes(sleep)) result.sleep_schedule = 'early sleeper';
    else if (['night_owl', 'night', 'late'].includes(sleep)) result.sleep_schedule = 'night owl';
    else if (['balanced', 'flexible'].includes(sleep)) result.sleep_schedule = 'balanced';
    else result.sleep_schedule = 'balanced';
  }

  // smoking
  const smoke = data.smoking || data.smokingStatus || data.smoking_status;
  if (smoke) {
    if (['smoker', 'yes'].includes(smoke)) result.smoking_status = 'yes';
    else if (['non-smoker', 'no'].includes(smoke)) result.smoking_status = 'no';
    else result.smoking_status = 'no';
  }

  // cleanliness
  const cleanliness = data.cleanlinessLevel || data.cleanliness_level;
  if (cleanliness !== undefined) {
    if (cleanliness === 'very_clean' || cleanliness === 'very clean') result.cleanliness_level = 'very clean';
    else if (cleanliness === 'moderate') result.cleanliness_level = 'moderate';
    else if (cleanliness === 'relaxed') result.cleanliness_level = 'relaxed';
    else result.cleanliness_level = String(cleanliness) || 'moderate';
  }

  // noise tolerance
  const noise = data.noiseTolerance || data.noise_tolerance;
  if (noise !== undefined) {
    if (noise === 'very_quiet' || noise === 'very quiet') result.noise_tolerance = 'very quiet';
    else if (noise === 'moderate') result.noise_tolerance = 'moderate';
    else if (noise === 'doesnt_matter' || noise === 'doesnt matter') result.noise_tolerance = 'doesnt matter';
    else result.noise_tolerance = String(noise) || 'moderate';
  }

  // social style / social energy
  const social = data.socialStyle || data.socialEnergy || data.social_level;
  if (social !== undefined) {
    if (['introvert', 'minimal', 'independent'].includes(social)) result.social_level = 'introvert';
    else if (['ambivert', 'balanced'].includes(social)) result.social_level = 'ambivert';
    else if (['extrovert', 'close', 'social'].includes(social)) result.social_level = 'extrovert';
    else result.social_level = String(social) || 'ambivert';
  }

  // study style / habits
  const study = data.studyStyle || data.studyHabits || data.study_level;
  if (study !== undefined) {
    if (['quiet_focused', 'quiet', 'quiet and focused'].includes(study)) result.study_level = 'quiet and focused';
    else if (study === 'flexible') result.study_level = 'flexible';
    else if (['background_music', 'music', 'with background music'].includes(study)) result.study_level = 'with background music';
    else result.study_level = String(study) || 'flexible';
  }

  // guest / hosting preference
  const guest = data.guestsVisitors || data.hostingStyle || data.guest_preference;
  if (guest) {
    result.guest_preference = guest;
  }

  return result;
}

function mapDbPreferencesToUi(record) {
  if (!record) return {};
  
  const sleepVal = (record.sleep_schedule || '').toLowerCase().replace(/_/g, ' ').trim();
  const cleanVal = (record.cleanliness_level || '').toLowerCase().replace(/_/g, ' ').trim();
  const noiseVal = (record.noise_tolerance || '').toLowerCase().replace(/_/g, ' ').trim();
  const socialVal = (record.social_level || '').toLowerCase().replace(/_/g, ' ').trim();
  const studyVal = (record.study_level || '').toLowerCase().replace(/_/g, ' ').trim();

  return {
    ...record,
    student_id: record.student_id ? record.student_id.toString() : null,
    
    // UI mapping fields (for st2Qus / st3Qus compatibility)
    sleepSchedule: sleepVal === 'night owl' ? 'night_owl' : (sleepVal === 'balanced' ? 'balanced' : 'early_sleeper'),
    sleepType: sleepVal === 'night owl' ? 'night' : (sleepVal === 'balanced' ? 'flexible' : 'early'),
    smoking: record.smoking_status === 'yes' ? 'smoker' : 'non-smoker',
    
    cleanlinessLevel: (cleanVal === 'very clean' || cleanVal === '5' || cleanVal === '4') ? 'very_clean' : ((cleanVal === 'relaxed' || cleanVal === '1' || cleanVal === '2') ? 'relaxed' : 'moderate'),
    noiseTolerance: (noiseVal === 'very quiet' || noiseVal === '1' || noiseVal === '2') ? 'very_quiet' : ((noiseVal === 'doesnt matter' || noiseVal === '5' || noiseVal === '4') ? 'doesnt_matter' : 'moderate'),
    socialStyle: (socialVal === 'introvert' || socialVal === 'minimal' || socialVal === '1' || socialVal === '2') ? 'introvert' : ((socialVal === 'extrovert' || socialVal === 'close' || socialVal === '5' || socialVal === '4') ? 'extrovert' : 'ambivert'),
    studyStyle: (studyVal === 'quiet and focused' || studyVal === '5' || studyVal === '4') ? 'quiet_focused' : ((studyVal === 'with background music' || studyVal === 'background music' || studyVal === '1' || studyVal === '2') ? 'background_music' : 'flexible'),
    guestsVisitors: record.guest_preference,
    
    socialType: (socialVal === 'introvert' || socialVal === 'minimal' || socialVal === 'independent' || socialVal === '1' || socialVal === '2') ? 'independent' : 'social',
    roomVibe: (studyVal === 'quiet and focused' || studyVal === 'study' || studyVal === '5' || studyVal === '4') ? 'study' : 'chill',
    studyHabits: (studyVal === 'quiet and focused' || studyVal === '5' || studyVal === '4') ? 'quiet' : ((studyVal === 'with background music' || studyVal === 'background music' || studyVal === '1' || studyVal === '2') ? 'music' : 'flexible'),
    hostingStyle: record.guest_preference || 'sometimes',
    socialEnergy: (socialVal === 'introvert' || socialVal === 'minimal' || socialVal === '1' || socialVal === '2') ? 'minimal' : ((socialVal === 'extrovert' || socialVal === 'close' || socialVal === '5' || socialVal === '4') ? 'close' : 'balanced'),
  };
}

