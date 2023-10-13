import MediaManager from "../src/media-manager.js";

const mediaManager = new MediaManager();
//mediaManager.scanFiles();
await mediaManager.scanFiles();
const out = await mediaManager.convert();
console.log('End!', out);