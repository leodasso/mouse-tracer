export default class Event {

    constructor(eventName) {
        this.eventName = eventName;
        this.invocationList = [];
    }

    invoke() {

        console.log('invoking', this.eventName);
        // TODO
        for (let listener of this.invocationList) {
            listener();
        }
    }

    addListener(listener) {
        console.log(this.eventName, 'adding', listener);
        this.invocationList.push(listener);
    }

    removeListener(listener) {

        // TODO 
        console.log(this.eventName, 'removing', listener);
    }
}