const STORAGE_KEYS = ["userData", "userInfo"];

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
};
