export const getAuthToken = (role) => {
    const activeRole = role || sessionStorage.getItem("activeRole");
    if (activeRole) {
        return localStorage.getItem(`${activeRole}_token`);
    }
    return localStorage.getItem("token");
};

export const getAuthUser = (role) => {
    const activeRole = role || sessionStorage.getItem("activeRole");
    if (activeRole) {
        return JSON.parse(localStorage.getItem(`${activeRole}_user`) || "null");
    }
    return JSON.parse(localStorage.getItem("user") || "null");
};

export const setAuthData = (token, user) => {
    const role = user.account_type;
    localStorage.setItem(`${role}_token`, token);
    localStorage.setItem(`${role}_user`, JSON.stringify(user));
    localStorage.setItem("token", token); // Fallback
    localStorage.setItem("user", JSON.stringify(user)); // Fallback
    sessionStorage.setItem("activeRole", role);
};

export const clearAuthData = (role) => {
    if (role) {
        localStorage.removeItem(`${role}_token`);
        localStorage.removeItem(`${role}_user`);
        if (sessionStorage.getItem("activeRole") === role) {
            sessionStorage.removeItem("activeRole");
        }
    } else {
        // Clear current role
        const currentRole = sessionStorage.getItem("activeRole");
        if (currentRole) {
            localStorage.removeItem(`${currentRole}_token`);
            localStorage.removeItem(`${currentRole}_user`);
            sessionStorage.removeItem("activeRole");
        }
        // Fallback clear
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    }
};
