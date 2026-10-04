import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Storage prototype & localStorage for Node 22+ & JSDOM compatibility
const localStore: Record<string, string> = {};

if (typeof window !== 'undefined') {
  if (typeof Storage !== 'undefined') {
    Storage.prototype.getItem = function (key: string) {
      return key in localStore ? localStore[key] : null;
    };
    Storage.prototype.setItem = function (key: string, value: string) {
      localStore[key] = String(value);
    };
    Storage.prototype.removeItem = function (key: string) {
      delete localStore[key];
    };
    Storage.prototype.clear = function () {
      for (const k of Object.keys(localStore)) {
        delete localStore[k];
      }
    };
    Storage.prototype.key = function (index: number) {
      return Object.keys(localStore)[index] ?? null;
    };
    Object.defineProperty(Storage.prototype, 'length', {
      get() {
        return Object.keys(localStore).length;
      },
      configurable: true,
    });
  }

  const storageInstance = Object.create(Storage.prototype);
  Object.defineProperty(window, 'localStorage', {
    value: storageInstance,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(globalThis, 'localStorage', {
    value: storageInstance,
    writable: true,
    configurable: true,
  });
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
