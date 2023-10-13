import EventBus from "../src/event-bus.js";
import EventEmitter from "events";

const eventBus = new EventBus();
//const eventBus = new EventEmitter();

eventBus.on('test', function(arg1, arg2, arg3) {
    console.log(`On test, arg1=${arg1}, arg2=${arg2}, arg3=${arg3}`);
});

const testAsyncOK = function() {
    return new Promise((resolve, reject) => {
        setTimeout(function() {
            resolve();
        }, 1000);
    });
}

const testAsyncError = function() {
    return new Promise((resolve, reject) => {
        setTimeout(function() {
            reject('some error');
        }, 1000);
    });
}


eventBus.on('testAsync', async function(arg1, arg2, arg3) {
    await testAsyncOK();
    await testAsyncError();
});


eventBus.emit('test', 1, 2, 3);
eventBus.emit('test', 1, 2);
eventBus.emit('test', 1);
eventBus.emit('test');

eventBus.emit('testAsync');
eventBus.emit('testAsync');

console.log('End sending, wait...');