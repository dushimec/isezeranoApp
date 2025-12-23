
export const USER_ROLES = {
  ADMIN: 'Admin',
  SECRETARY: 'Secretary',
  DISCIPLINARIAN: 'Disciplinarian',
  SINGER: 'Singer',
  SECTION_LEADER: 'Section Leader',
};

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
