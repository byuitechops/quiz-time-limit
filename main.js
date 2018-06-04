const canvas = require('canvas-wrapper');

module.exports = (course, stepCallback) => {
    
    stepCallback(null, course);
};