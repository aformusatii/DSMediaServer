import {CONFIG, saveConfig} from '../src/configuration.js';

console.log(CONFIG.common);

CONFIG.scheduler = {
    enabled: true
}

saveConfig();