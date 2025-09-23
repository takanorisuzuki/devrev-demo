/**
 * 基本的なテスト
 * CI/CDでテストが正常に実行されることを確認
 */

import { describe, it, expect } from "vitest";

describe("Basic Tests", () => {
  it("should pass basic math test", () => {
    expect(2 + 2).toBe(4);
  });

  it("should handle string concatenation", () => {
    expect("Hello" + " " + "World").toBe("Hello World");
  });

  it("should handle array operations", () => {
    const arr = [1, 2, 3];
    expect(arr.length).toBe(3);
    expect(arr.includes(2)).toBe(true);
  });
});

describe("Environment Tests", () => {
  it("should be running in test environment", () => {
    expect(process.env.NODE_ENV).toBe("test");
  });
});
