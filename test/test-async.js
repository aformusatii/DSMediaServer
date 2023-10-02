import {isSet} from "../src/utils.js";
import EventEmitter from "events";

let lastActivityTime = undefined;

const getElapsedTimeFromLastActivity = function() {
    if (isSet(lastActivityTime)) {
        const currentTime = new Date();
        return currentTime.getTime() - lastActivityTime.getTime();
    } else {
        return Number.MAX_SAFE_INTEGER;
    }
}

const updateLastActivityTime = function() {
    lastActivityTime = new Date();
}

const eventBus = new EventEmitter();

const call = async function() {
    if (getElapsedTimeFromLastActivity() < 1) {
        console.log('SKIP!');
        return;
    }
    console.log('call');
    updateLastActivityTime();
}

eventBus.on('EVENT', async function() {
    await call();
});

for (let i = 0; i < 10; i++) {
    eventBus.emit('EVENT');
}