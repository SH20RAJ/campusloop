import { describe, expect, it } from "vitest";
import { deleteR2Object, getR2Object, putR2Object } from "./r2";

describe("R2 Cloudflare Storage Engine", () => {
  it("should successfully put an object into storage and return correct metadata", async () => {
    const key = "test/probe-1.txt";
    const testData = new TextEncoder().encode("Hello CampusLoop R2 Storage!");
    const contentType = "text/plain";

    const result = await putR2Object(key, testData, contentType, { tag: "verification" });

    expect(result.key).toBe(key);
    expect(result.url).toBe(`/api/files/r2/${key}`);
    expect(result.contentType).toBe(contentType);
    expect(result.size).toBe(testData.byteLength);
  });

  it("should retrieve stored objects with correct content type and data", async () => {
    const key = "test/probe-get.json";
    const payload = JSON.stringify({ status: "ok", app: "campusloop" });
    const bytes = new TextEncoder().encode(payload);

    await putR2Object(key, bytes, "application/json");

    const retrieved = await getR2Object(key);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.contentType).toBe("application/json");
    expect(retrieved?.size).toBe(bytes.byteLength);

    if (retrieved?.body instanceof Uint8Array) {
      const decoded = new TextDecoder().decode(retrieved.body);
      expect(decoded).toBe(payload);
    }
  });

  it("should return null when getting non-existent objects", async () => {
    const nonExistent = await getR2Object("non-existent-key-12345");
    expect(nonExistent).toBeNull();
  });

  it("should successfully delete objects from storage", async () => {
    const key = "test/delete-target.txt";
    const data = new TextEncoder().encode("to be deleted");

    await putR2Object(key, data, "text/plain");
    const before = await getR2Object(key);
    expect(before).not.toBeNull();

    const deleted = await deleteR2Object(key);
    expect(deleted).toBe(true);

    const after = await getR2Object(key);
    expect(after).toBeNull();
  });
});
