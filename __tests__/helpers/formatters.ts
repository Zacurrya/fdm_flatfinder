import { jest } from "@jest/globals";

// Mocks the system time using Jest fake timers

export const mockSystemTime = (date: string | Date | number) => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(date));
};


// Restores the real system time
export const restoreRealTime = () => {
    jest.useRealTimers();
};
