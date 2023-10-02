const test = function(...args) {
    console.log('args.length', args.length);
    for(let i = 0; i < args.length; i++) {
        console.log(`args[${i}]=${args[i]}`);
    }
}

const test2 = function(...args) {
    test(...args)
}

test2();