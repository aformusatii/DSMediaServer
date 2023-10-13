import EventEmitter from "events";

export default class EventBus {

    constructor() {
        this.eventEmitter = new EventEmitter();
    }

    emit(eventName, ...args) {
        this.eventEmitter.emit(eventName, ...args);
    }

    on(eventName, listener) {
        this.eventEmitter.on(eventName, function(...args) {
            (async function() {
                try {
                    await listener(...args);
                } catch (ex) {
                    console.log(`Exception caught during event [${eventName}]:`, ex);
                }
            })();
        });
    }

}