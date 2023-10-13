import {fileURLToPath} from "url";
import path from "path";
import fs from 'fs';
import YAML from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.join(__dirname, '..', 'config.yaml');

export let CONFIG = {};
export let RAW_CONFIG = '';

const loadConfig = function(fullURI) {
    console.log('Load configuration from: ', configPath);

    const fileContent = fs.readFileSync(configPath, 'utf8');
    CONFIG = YAML.parse(fileContent);
    RAW_CONFIG = fileContent;
}

loadConfig();

export const saveConfig = function() {
    const fileContent = YAML.stringify(CONFIG);
    RAW_CONFIG = fileContent;

    fs.writeFileSync(configPath, fileContent);
}

export const saveRawConfig = function(fileContent) {
    CONFIG = YAML.parse(fileContent);
    RAW_CONFIG = fileContent;

    fs.writeFileSync(configPath, fileContent);
}