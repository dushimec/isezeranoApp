
export const USER_ROLES = {
  ADMIN: 'Admin',
  SECRETARY: 'Secretary',
  DISCIPLINARIAN: 'Disciplinarian',
  SINGER: 'Singer',
} as const;

// If you need a type for the role values:
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
