import * as MediaServer from './media-server.js'
import * as NotificationServer from './notification-server.js'
import * as WebServer from './web-server.js'
import DeviceDiscovery from './device-discovery.js'
import DeviceManager from './device-manager.js';
import WakeOnLanService from './wakeOnLan-service.js';
import EventBus from "./event-bus.js";
import MediaManager from "./media-manager.js";
import Scheduler from "./scheduler.js";

const appContext = {}
appContext.eventBus = new EventBus();

const deviceDiscovery = new DeviceDiscovery(appContext);
appContext.deviceDiscovery = deviceDiscovery;

const deviceManager = new DeviceManager(appContext);
appContext.deviceManager = deviceManager;

const wakeOnLanService = new WakeOnLanService(appContext);
appContext.wakeOnLanService = wakeOnLanService;

const mediaManager = new MediaManager(appContext);
appContext.mediaManager = mediaManager;

const scheduler =  new Scheduler(appContext);
appContext.scheduler = scheduler;

MediaServer.setupServer(appContext);
NotificationServer.setupServer(appContext);
WebServer.setupServer(appContext);

mediaManager.scanFiles();