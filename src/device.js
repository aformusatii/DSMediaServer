import {isNotSet, isSet} from "./utils.js";
import {CONNECTION_STATE, PLAYBACK_STATE} from './constants.js';

export default class Device {

    constructor(data) {
        this.data = data
        this.activities = {};
        this.disabledActivities = {};

        this.playbackState = PLAYBACK_STATE.STOPPED;
        this.data.playbackState = PLAYBACK_STATE.STOPPED;

        this.connectionState = CONNECTION_STATE.DISCONNECTED;
        this.data.connectionState = CONNECTION_STATE.DISCONNECTED;

        this.connectionErrorCount = 0;

        this.mediaFiles = [];
        this.mediaFileIndex = 0;
    }

    /* ============================================================================== */
    updateLastActivityTime(activity) {
        this.activities[activity] = new Date();
    }

    getElapsedTimeFromLastActivity(activity) {
        return this.activities[activity].getTime();
    }

    /* ============================================================================== */
    isActivityDisabled(activity) {
        const disableTimeMillis = this.disabledActivities[activity];

        if (isNotSet(disableTimeMillis)) {
            return false;
        }

        const currentTime = new Date();
        // If we did not yet reach the disableTimeMillis then this activity will be considered disabled
        return currentTime.getTime() < disableTimeMillis;
    }

    disableTemporaryActivity(activity, disableTimeMillis) {
        const currentTime = new Date();
        this.disabledActivities[activity] = currentTime.getTime() + disableTimeMillis;
    }

    resetDisabledActivity(activity) {
        this.disabledActivities[activity] = undefined;
    }

    /* ============================================================================== */
    setPlaybackState(state) {
        //console.log('setStatus->', status)
        this.playbackState = state;
        this.data.playbackState = state;
    }

    hasPlaybackState(state) {
        return this.playbackState === state;
    }

    /* ============================================================================== */
    setConnectionState(state) {
        this.connectionState = state;
        this.data.connectionState = state;
    }

    hasOneOfConnectionStates(...states) {
        return states.includes(this.connectionState);
    }

    /* ============================================================================== */
    incrementConnectionErrorCounter() {
        this.connectionErrorCount++;
    }

    resetConnectionErrorCounter() {
        this.connectionErrorCount = 0;
    }

    getConnectionErrorCounter() {
        return this.connectionErrorCount;
    }

    /* ============================================================================== */
    setMediaFiles(files) {
        this.mediaFiles = files;
    }

    getNextMediaFile() {
        if (this.mediaFileIndex >= this.mediaFiles.length) {
            this.mediaFileIndex = 0;
        }

        const mediaFile = this.mediaFiles[this.mediaFileIndex];

        this.mediaFileIndex++;
        return mediaFile;
    }

    /* ============================================================================== */
    toString = function() {
        return `TV[${this.data.mac} | ${this.data.ip} | ${this.data.friendlyName}]`;
    }

}