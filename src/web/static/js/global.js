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