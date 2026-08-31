import { describe, expect, it } from "vitest";
import {
  channelForType,
  DEFAULT_NOTIFICATION_PREFERENCES,
  isMuteChannel,
  NOTIFICATION_CHANNELS,
  type NotificationChannel,
} from "./notification-preferences";

describe("channelForType", () => {
  it("groups the types a student thinks of as one thing", () => {
    // Muting "comments" has to cover threaded replies too, or the setting lies.
    expect(channelForType("COMMENT")).toBe("COMMENT");
    expect(channelForType("REPLY")).toBe("COMMENT");

    expect(channelForType("FOLLOW")).toBe("FOLLOW");
    expect(channelForType("FRIEND")).toBe("FOLLOW");

    expect(channelForType("STORY_LIKE")).toBe("STORY");
    expect(channelForType("STORY_REPLY")).toBe("STORY");

    expect(channelForType("MATCH")).toBe("MATCH");
    expect(channelForType("CRUSH_ALERT")).toBe("MATCH");
  });

  it("maps the two new delivery types to their own channels", () => {
    expect(channelForType("MESSAGE")).toBe("MESSAGE");
    expect(channelForType("NEW_POST")).toBe("POST");
  });

  it("fails open for unmapped types", () => {
    // A null channel means "always deliver". This is deliberate: a newly added
    // notification type must never be silently swallowed by a stale mapping.
    expect(channelForType("SOME_FUTURE_TYPE")).toBeNull();
    expect(channelForType("EVENT_REGISTRATION")).toBeNull();
    expect(channelForType("MILESTONE")).toBeNull();
  });

  it("only ever returns a real channel", () => {
    const types = [
      "LIKE",
      "COMMENT",
      "REPLY",
      "MENTION",
      "REPOST",
      "MATCH",
      "CRUSH_ALERT",
      "FOLLOW",
      "FRIEND",
      "STORY_LIKE",
      "STORY_REPLY",
      "MESSAGE",
      "NEW_POST",
    ];
    for (const type of types) {
      const channel = channelForType(type);
      expect(channel).not.toBeNull();
      expect(NOTIFICATION_CHANNELS).toContain(channel as NotificationChannel);
    }
  });
});

describe("isMuteChannel", () => {
  it("accepts every real channel plus the ALL wildcard", () => {
    for (const channel of NOTIFICATION_CHANNELS) {
      expect(isMuteChannel(channel)).toBe(true);
    }
    expect(isMuteChannel("ALL")).toBe(true);
  });

  it("rejects anything else, so the API cannot store a junk channel", () => {
    expect(isMuteChannel("EVERYTHING")).toBe(false);
    expect(isMuteChannel("post")).toBe(false); // case-sensitive on purpose
    expect(isMuteChannel("")).toBe(false);
    expect(isMuteChannel(null)).toBe(false);
    expect(isMuteChannel(undefined)).toBe(false);
    expect(isMuteChannel(42)).toBe(false);
  });
});

describe("DEFAULT_NOTIFICATION_PREFERENCES", () => {
  it("is all-on except the friends-only narrowing", () => {
    // A student who never opens settings must get everything. Absence of a
    // preferences row means these defaults apply.
    const { followedPostsFriendsOnly, ...channels } = DEFAULT_NOTIFICATION_PREFERENCES;
    expect(followedPostsFriendsOnly).toBe(false);
    for (const [key, value] of Object.entries(channels)) {
      expect(value, `${key} should default to on`).toBe(true);
    }
  });

  it("covers every channel, so no channel is unreachable from settings", () => {
    // Guards against adding a channel and forgetting the switch that turns it
    // off — the panel is driven by these keys.
    const keys = Object.keys(DEFAULT_NOTIFICATION_PREFERENCES);
    expect(keys).toEqual(
      expect.arrayContaining([
        "messages",
        "followedPosts",
        "likes",
        "comments",
        "mentions",
        "follows",
        "reposts",
        "matches",
      ])
    );
  });
});
