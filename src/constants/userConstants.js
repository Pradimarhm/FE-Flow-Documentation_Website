export const USER_ENDPOINTS = {
    BASE: "/users",
    DETAIL: (id) => `/users/${id}`,
};

export const USER_PERMISSIONS = {
    READ: "users:read",
    CREATE: "users:create",
    UPDATE: "users:update",
    DELETE: "users:delete",
};

export const DEFAULT_USER_FORM = {
    role_id: 2,
    name: "",
    email: "",
    password: "",
};
