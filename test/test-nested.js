const getNestedObjectV2 = function(obj, key) {
    return key.split(".").reduce(function(o, x) {
        let foundKey = null;

        if (typeof o == "undefined" || o === null) {
            return o;
        }
        Object.keys(o).forEach((key, index) => {
            if (key.includes(x)) {
                foundKey = key;
            }
        });

        console.log(o,' - ', x, ' - ', foundKey);

        return o[foundKey];

    }, obj);
}


const obj = {
    elementA1: {
        elementA2: {
            elementA3: 123
        }
    }
}

console.log('RESULT:', getNestedObjectV2(obj, 'element.element'));