// Jest setup file
require('@testing-library/jest-dom');

// Mock React Native
jest.mock('react-native', () => ({
  Platform: {
    OS: 'web',
    select: jest.fn(obj => obj.web || obj.default),
  },
  StyleSheet: {
    create: (styles) => styles,
  },
  Dimensions: {
    get: jest.fn().mockReturnValue({ width: 375, height: 812 }),
  },
  TouchableOpacity: 'TouchableOpacity',
  View: 'View',
  Text: 'Text',
  TextInput: 'TextInput',
  ScrollView: 'ScrollView',
  Image: 'Image',
  Alert: {
    alert: jest.fn()
  },
  Animated: {
    Value: jest.fn(),
    timing: jest.fn(() => ({
      start: jest.fn(),
    })),
  },
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));
