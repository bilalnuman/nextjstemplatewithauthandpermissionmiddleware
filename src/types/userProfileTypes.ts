export type SubscriptionStatus =
    | "active"
    | "inactive"
    | "canceled"
    | "past_due"
    | "trialing"
    | "expired"
    | string;

export type PlanName =
    | "EXPLORE"
    | "BASIC"
    | "PRO"
    | "ENTERPRISE"
    | string;

export type Permission = "read" | "write"; // extend later

export type ProfileSuccess = {
    success: true;
    statusCode: 200;
    id: number;
    name: string;
    email: string;
    profile_picture: string | null;
    is_subscribed: boolean;
    plan_name: PlanName | null;
    is_trial: boolean | null;
    status: SubscriptionStatus | null;
    is_active: boolean | null;
    permissions: Permission[]; // ✅
    currentUrl?: string
};

export type ProfileError = {
    success: false;
    statusCode: number;
    message: string;
    reason?: string;
    currentUrl?:string
};

export type ProfileResponse = ProfileSuccess | ProfileError;

export const isProfileSuccess = (x: ProfileResponse): x is ProfileSuccess =>
    x.success === true;