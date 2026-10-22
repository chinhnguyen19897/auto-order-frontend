import {api} from './api';

export type LoginState = {
    error: string | null;
    success: boolean;
}

export const initialLoginState: LoginState = {
    error: null,
    success: false,
}

export async function loginActions(_prevState: LoginState, formData: FormData): Promise<LoginState> {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return {
            error: "Email and password are required",
            success: false,
        };
    }

    try {
        await api("auth/login", {email, password}, "POST")

        return {
            error: null,
            success: true,
        }
    } catch (e) {
        return {
            error: e instanceof Error ? e.message : "Login failed",
            success: false,
        }
    }

}