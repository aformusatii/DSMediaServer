import {exec} from 'child_process';

export default class ChildProcess {

    constructor() {

    }

    execute(command) {
        console.log('Execute command: ', command);
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(stdout + stderr);
            });
        });
    }

}