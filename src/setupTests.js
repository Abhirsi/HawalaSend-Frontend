// Jest setup with extended matchers and global mocks
import '@testing-library/jest-dom/extend-expect';
import { configure } from '@testing-library/react';
import { TextEncoder, TextDecoder } from 'util';
import failOnConsole from 'jest-fail-on-console';

// Global mocks
global.matchMedia = global.matchMedia || function() {
  return {
    matches: false,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  };
};

// Polyfills for Node environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Configure Testing Library
configure({
  testIdAttribute: 'data-test-id',
  asyncUtilTimeout: 5000,
});

// Fail tests on console errors/warnings
failOnConsole({
  shouldFailOnWarn: true,
  shouldFailOnError: true,
  silenceMessage: (message, method) => {
    // Allow specific warnings
    if (method === 'warn' && message.includes('deprecated')) return true;
    return false;
  }
});

// Mock global objects
beforeEach(() => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store = {};
    return {
      getItem: jest.fn((key) => store[key]),
      setItem: jest.fn((key, value) => {
        store[key] = value.toString();
      }),
      removeItem: jest.fn((key) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        store = {};
      }),
    };
  })();
  
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    configurable: true,
    writable: true,
  });

  // Mock fetch
  global.fetch = jest.fn(() => Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
  }));
});

// Custom matchers
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    return {
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be within range ${floor}-${ceiling}`,
      pass,
    };
  },
});

// Reset mocks after each test
afterEach(() => {
  jest.clearAllMocks();
  window.localStorage.clear();
});

// Setup for MSW (Mock Service Worker)
if (process.env.REACT_APP_API_MOCKING === 'enabled') {
  const { server } = require('./mocks/server');
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
}