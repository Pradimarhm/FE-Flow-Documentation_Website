import { useAuthStore } from "@/store/authStore";
import { usePermissionStore } from "@/store/permissionStore";

export const usePermissions = () => {
    const user = useAuthStore((state) => state.user);
    const permissions = usePermissionStore((state) => state.permissions);

    const hasPermission = (moduleSlug, action) => {
        if (!user || !user.role_id) return false;

        const matched = permissions.find(
            (p) =>
                p.role_id === user.role_id &&
                (p.module?.slug === moduleSlug || String(p.module_id) === String(moduleSlug))
        );

        if (!matched || !matched.permission) return false;

        // Jika DB berupa Object: {"read": true, "create": false}
        if (typeof matched.permission === "object" && !Array.isArray(matched.permission)) {
            return Boolean(matched.permission[action]);
        }

        // Fallback jika DB berupa Array: ["read", "create"]
        if (Array.isArray(matched.permission)) {
            return matched.permission.includes(action);
        }

        return false;
    };

    return { hasPermission, permissions };
};