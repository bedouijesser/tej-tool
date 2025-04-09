// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Add custom matchers
expect.extend({
  toBeCloseTo(received, expected, precision = 2) {
    const pass = Math.abs(received - expected) < Math.pow(10, -precision) / 2;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be close to ${expected} with ${precision} decimal precision`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be close to ${expected} with ${precision} decimal precision`,
        pass: false,
      };
    }
  },
});