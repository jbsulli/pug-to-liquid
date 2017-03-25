"use strict";

/* globals it, expect */

const fs = require('fs');
const path = require('path');

const parseLiquid = require('../src/parse-liquid.js');

const OC_DIR = path.join(__dirname, 'oc');

if(fs.existsSync(OC_DIR)){
    fs.readdirSync(OC_DIR).forEach(file => {
        it(file, () => {
            expect(() => parseLiquid(fs.readFileSync(path.join(OC_DIR, file), 'utf8'), file)).not.toThrow();
        });
    });
} else {
    it('should be fine if no oc folder', () => {});
}
