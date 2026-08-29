import step1Img from "../assets/imgs/undraw_profile-data_xkr9.svg";
import step2Img from "../assets/imgs/undraw_group-hangout_o22u (1).svg";
import step3Img from "../assets/imgs/undraw_best-place_dhzp.svg";

/**
 * Gets the localized content for the auth page based on current state.
 * @param {Function} t - Translation function
 * @param {number} step - Current registration step
 * @param {boolean} isLogin - Whether the user is on the login view
 */
export const getAuthContent = (t, step, isLogin) => {
  if (isLogin) {
    return {
      title: t("login_page.dynamic.login.title"),
      subtitle: t("login_page.dynamic.login.subtitle"),
      img: step1Img,
      badge: t("login_page.dynamic.login.badge"),
    };
  }

  const contentMap = {
    1: {
      title: t("login_page.dynamic.step1.title"),
      subtitle: t("login_page.dynamic.step1.subtitle"),
      img: step1Img,
      badge: t("login_page.dynamic.step1.badge"),
    },
    2: {
      title: t("login_page.dynamic.step2.title"),
      subtitle: t("login_page.dynamic.step2.subtitle"),
      img: step2Img,
      badge: t("login_page.dynamic.step2.badge"),
    },
    3: {
      title: t("login_page.dynamic.step3.title"),
      subtitle: t("login_page.dynamic.step3.subtitle"),
      img: step3Img,
      badge: t("login_page.dynamic.step3.badge"),
    },
  };

  return contentMap[step] || contentMap[1];
};
