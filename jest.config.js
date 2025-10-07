
module.exports = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    '^.+\\\.(t|j)sx?$': '@swc/jest',
  },
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/app/(.*)$': '<rootDir>/src/app/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/firebase/(.*)$': '<rootDir>/src/firebase/$1',
    '^@/auth/(.*)$': '<rootDir>/src/auth/$1',
    
    "@/components/ui/button": "<rootDir>/src/components/ui/button.tsx",
    "@/components/ui/form": "<rootDir>/src/components/ui/form.tsx",
    "@/components/ui/input": "<rootDir>/src/components/ui/input.tsx",
    "@/components/ui/card": "<rootDir>/src/components/ui/card.tsx",
    "@/components/icons": "<rootDir>/src/components/icons.tsx",
    "@/hooks/use-toast": "<rootDir>/src/hooks/use-toast.ts",
    "@/firebase": "<rootDir>/src/firebase/index.ts",
    
    "^.+\\.svg$": "jest-svg-transformer",
    "^.+\\.css$": "jest-css-modules-transform"
  },
};
