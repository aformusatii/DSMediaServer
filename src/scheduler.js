import {CONFIG, saveConfig} from './configuration.js';
import {objToStr, setAsyncInterval} from "./utils.js";
import {EVENTS} from "./constants.js";
import moment from 'moment';

export default class Scheduler {

    constructor(appContext) {
        this.appContext = appContext;
        this.data = (CONFIG.scheduler) ? CONFIG.scheduler : {enabled: false};
        this.lastInMomentResult = null;

        setAsyncInterval('SchedulerJob', async function(scheduler) {
            scheduler.onCheck();
        }, 1000, this);
    }

    update(data) {
        console.log('Update scheduler', objToStr(data));
        this.data = data;
        CONFIG.scheduler = data;
        saveConfig();
    }

    getData() {
        return CONFIG.scheduler;
    }

    onCheck() {
        if (!this.data.enabled) {
            return;
        }

        const currentTime = moment();
        const currentDayOfWeek = currentTime.format('ddd'); // Get the current day of the week as a three-letter abbreviation (e.g., "Mon")

        // Check if the current time is within the time range
        const startTime = moment(this.data.startTime, 'HH:mm');
        const endTime = moment(this.data.endTime, 'HH:mm');

        const inMoment = (this.data.weekDays[currentDayOfWeek] === true) && currentTime.isBetween(startTime, endTime);

        if (this.lastInMomentResult !== inMoment) {
            this.lastInMomentResult = inMoment;
            const schedulerEventName = inMoment ? EVENTS.SCHEDULER_ON : EVENTS.SCHEDULER_OFF;
            this.appContext.eventBus.emit(schedulerEventName);
            console.log('Scheduler Event', schedulerEventName);
        }
    }

}