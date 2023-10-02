export default class AsyncLock {

    constructor () {
        this.disable = () => {}
        this.lock = Promise.resolve()
    }

    enable () {
        this.lock = new Promise(resolve => this.disable = resolve)
    }
}