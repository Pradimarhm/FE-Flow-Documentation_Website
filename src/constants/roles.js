export const ROLE_IDS = {
    ADMIN: 1,
    MANAGER: 2,
    EMPLOYEE: 3,
    USER: 4,
};

// Pemetaan ID role ke label teks untuk antarmuka (UI Display)
export const ROLE_LABELS = {
    [ROLE_IDS.ADMIN]: 'Administrator',
    [ROLE_IDS.MANAGER]: 'Manager',
    [ROLE_IDS.EMPLOYEE]: 'Karyawan',
    [ROLE_IDS.USER]: 'Pengguna',
};

// Opsi untuk form jika dibutuhkan
export const ROLE_OPTIONS = [
    { id: ROLE_IDS.ADMIN, value: ROLE_IDS.ADMIN, label: 'Administrator' },
    { id: ROLE_IDS.MANAGER, value: ROLE_IDS.MANAGER, label: 'Manager' },
    { id: ROLE_IDS.EMPLOYEE, value: ROLE_IDS.EMPLOYEE, label: 'Karyawan' },
    { id: ROLE_IDS.USER, value: ROLE_IDS.USER, label: 'Pengguna' },
];