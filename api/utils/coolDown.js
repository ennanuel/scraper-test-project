import { getLogJSON } from "./log.js";

// This logic is esures that each call to Amazon's website is made 10 seconds at a time.

const TEN_SECONDS_IN_MS = 10000;

const waitForCoolDown = (delayInMilliseconds) => new Promise((resolve) => setTimeout(resolve, delayInMilliseconds));

function checkIfShouldWaitForCoolDown() {
    const log = getLogJSON();
    const lastTimeLogWasCalled = log.lastCalled;
    const timePassed = Date.now() - lastTimeLogWasCalled;
    const shouldWaitForCoolDown = timePassed < TEN_SECONDS_IN_MS;
    const byHowLong = TEN_SECONDS_IN_MS - timePassed;
    return { shouldWaitForCoolDown, byHowLong };
}

export {
    waitForCoolDown,
    checkIfShouldWaitForCoolDown
}