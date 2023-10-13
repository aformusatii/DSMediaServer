$.notify.defaults({
    globalPosition: 'bottom left'
});

const showInfo = function(msg) {
    $('.notifyjs-wrapper').trigger('notify-hide');
    $.notify(msg, 'success');
}

const showError = function(msg) {
    $('.notifyjs-wrapper').trigger('notify-hide');
    $.notify(JSON.stringify(msg, null, 2), 'error');
}

const copyProperties = function(sourceObj, destinationObj) {
    Object.keys(sourceObj).forEach((key, index) => {
        destinationObj[key] = sourceObj[key];
    });
}

const angularJsInitHandlers = [];

const addAngularJsInit = function(callback) {
    angularJsInitHandlers.push(callback);
}