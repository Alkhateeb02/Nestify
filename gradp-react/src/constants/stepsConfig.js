import PersonalInfo from "../components/auth/steps/PersonalInfo";
import Step2_Profile from "../components/auth/steps/Step2_Profile";
import RoommatePrefs from "../components/auth/steps/RoommatePrefs";

export const STEP_COMPONENTS = {
  1: PersonalInfo,
  2: Step2_Profile,
  3: RoommatePrefs,
};

export const TOTAL_STEPS = Object.keys(STEP_COMPONENTS).length;

export const getStepComponent = (step) => {
  return STEP_COMPONENTS[step] || PersonalInfo;
};
