import { afterEach, describe, expect, it, vi } from "vitest";
import { logError, logInfo, logWarn } from "@/lib/utils/logger";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("logger", () => {
  it("émet une ligne JSON avec ts, level et event", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logInfo("test.event", { userId: "u1" });

    expect(spy).toHaveBeenCalledOnce();
    const parsed = JSON.parse(spy.mock.calls[0][0] as string);
    expect(parsed).toMatchObject({ level: "info", event: "test.event", userId: "u1" });
    expect(parsed.ts).toBeTypeOf("string");
  });

  it("route les warnings sur console.warn", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    logWarn("test.warn");
    expect(spy).toHaveBeenCalledOnce();
  });

  it("aplatit une Error en champs nommés", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logError("test.fail", new Error("boom"), { route: "x" });

    const parsed = JSON.parse(spy.mock.calls[0][0] as string);
    expect(parsed).toMatchObject({
      level: "error",
      event: "test.fail",
      errorName: "Error",
      errorMessage: "boom",
      route: "x",
    });
  });

  it("gère une valeur lancée qui n'est pas une Error", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logError("test.fail", "juste une string");

    const parsed = JSON.parse(spy.mock.calls[0][0] as string);
    expect(parsed.error).toBe("juste une string");
  });
});
