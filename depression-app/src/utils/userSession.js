const STORAGE_KEYS = ["userData", "userInfo"];
const AUTH_SESSION_KEY = "wm_auth_session";

const parseStoredValue = (key) => {
    try {
        const rawValue = window.localStorage.getItem(key);
        return rawValue ? JSON.parse(rawValue) : null;
    } catch (error) {
        console.error(`Unable to parse stored value for ${key}:`, error);
        return null;
    }
};

export const normalizeUserData = (value) => {
    if (!value) {
        return null;
    }

    if (Array.isArray(value)) {
        const [name, mobile, email, password, gender, dob, age] = value;
        return { name, mobile, email, password, gender, dob, age };
    }

    if (typeof value === "object") {
        const normalized = {
            name: value.name ?? value[0] ?? "",
            mobile: value.mobile ?? value[1] ?? "",
            email: value.email ?? value[2] ?? "",
            password: value.password ?? value[3] ?? "",
            gender: value.gender ?? value[4] ?? "",
            dob: value.dob ?? value[5] ?? "",
            age: value.age ?? value[6] ?? "",
        };

        return normalized.email ? normalized : null;
    }

    return null;
};

export const getStoredUserData = () => {
    if (typeof window === "undefined") {
        return null;
    }

    for (const key of STORAGE_KEYS) {
        const normalized = normalizeUserData(parseStoredValue(key));
        if (normalized) {
            return normalized;
        }
    }

    return null;
};

export const getStoredUserEmail = () => getStoredUserData()?.email || null;

export const saveUserAuthSession = (value) => {
    if (typeof window === "undefined") {
        return null;
    }

    const normalized = normalizeUserData(value);
    if (!normalized?.email) {
        return null;
    }

    const session = {
        role: "user",
        email: normalized.email,
        loggedInAt: new Date().toISOString(),
    };

    window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    return session;
};

export const saveAdminAuthSession = () => {
    if (typeof window === "undefined") {
        return null;
    }

    const session = {
        role: "admin",
        email: "admin_anupam2024@gmail.com",
        loggedInAt: new Date().toISOString(),
    };

    window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    return session;
};

export const getAuthSession = () => {
    if (typeof window === "undefined") {
        return null;
    }

    try {
        const rawValue = window.localStorage.getItem(AUTH_SESSION_KEY);
        return rawValue ? JSON.parse(rawValue) : null;
    } catch (error) {
        console.error("Unable to parse auth session:", error);
        return null;
    }
};

export const isUserAuthenticated = () => getAuthSession()?.role === "user" && Boolean(getStoredUserEmail());

export const isAdminAuthenticated = () => getAuthSession()?.role === "admin";

export const saveStoredUserData = (value) => {
    if (typeof window === "undefined") {
        return null;
    }

    const normalized = normalizeUserData(value);
    if (!normalized) {
        return null;
    }

    STORAGE_KEYS.forEach((key) => {
        window.localStorage.setItem(key, JSON.stringify(normalized));
    });

    return normalized;
};

export const clearStoredUserData = () => {
    if (typeof window === "undefined") {
        return;
    }

    STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
    window.localStorage.removeItem(AUTH_SESSION_KEY);
};
