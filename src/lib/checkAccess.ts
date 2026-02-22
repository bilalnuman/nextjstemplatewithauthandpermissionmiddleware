import { ProfileResponse, isProfileSuccess } from "../types/userProfileTypes";
export const toLowerCase = (name: string) => name.toLocaleLowerCase().trim()

export const checkAccess = (user: ProfileResponse) => {
    if (!isProfileSuccess(user)) return false;
    // if (toLowerCase(user.plan_name!) === "explore" && user.currentUrl === "payments") {
    //     return false
    // }
    return true
};