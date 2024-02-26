import { getLogJSON } from "./log.js";

const COOL_DOWN_TIME_IN_MS = 10000;
const TEN_SECONDS_IN_MS = 10000;

const waitForCoolDown = () => new Promise((resolve) => setTimeout(resolve, COOL_DOWN_TIME_IN_MS));

function checkIfShouldWaitForCoolDown() {
    const log = getLogJSON();
    const lastTimeLogWasCalled = log.lastCalled
    const timePassed = Date.now() - lastTimeLogWasCalled;
    const shouldWaitForCoolDown = timePassed < TEN_SECONDS_IN_MS;
    return shouldWaitForCoolDown;
}

export {
    waitForCoolDown,
    checkIfShouldWaitForCoolDown
}