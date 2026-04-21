import { afterEach, describe, expect, test } from "@jest/globals";
import { formatRelativeDate, formatTime, getInitials } from "@utils/formatters";
import { mockSystemTime, restoreRealTime } from "../helpers/formatters";

describe("getInitials", () => {
    test("should return initials for a full name", () => {
        const result = getInitials("John Doe");
        expect(result).toBe("JD");
    })

    /*
    These tests outine behaviours I need to enable:

    test("should return one initial from a single name", () => {
    })
    test("should return three initials for middle name", () => {
    })
    */
})

describe("formatTime", () => {
    test("should format time correctly", () => {
        const result = formatTime("2026-01-01T12:00:00");
        expect(result).toBe("12:00");
    })
})

describe("formatRelativeDate", () => {
    afterEach(() => {
        restoreRealTime();
    });

    test("returns time if same day", () => {
        mockSystemTime("2026-04-20T16:00:00Z");
        const result = formatRelativeDate("2026-04-20T14:35:00Z");

        // Format should be HH:MM
        expect(result).toMatch(/^\d{2}:\d{2}$/);
    });

    test("returns 'Yesterday' for yesterday's date", () => {
        mockSystemTime("2026-04-21T10:00:00Z"); // today is April 21
        const result = formatRelativeDate("2026-04-20T14:35:00Z"); // yesterday is April 20

        expect(result).toBe("Yesterday");
    });

    test("returns day and month for older dates", () => {
        mockSystemTime("2026-04-20T16:00:00Z"); // today
        const result = formatRelativeDate("2026-04-10T14:35:00Z"); // 10 days ago

        // Format is "10 Apr" (en-GB format: day + short month)
        expect(result).toBe("10 Apr");
    });

    test("handles dates from different months", () => {
        mockSystemTime("2026-04-20T16:00:00Z");
        const result = formatRelativeDate("2026-03-15T14:35:00Z");

        expect(result).toBe("15 Mar");
    });
});
