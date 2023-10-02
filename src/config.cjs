const YAML = require('yaml')
const fs = require('fs')
const path = require('path')

const configPath = path.join(__dirname, '..', 'config.yaml');
console.log('Load configuration from: ', configPath);

const file = fs.readFileSync(configPath, 'utf8')
const CONFIG = YAML.parse(file)

module.exports = CONFIG;

