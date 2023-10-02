import Net from "net";

class SocketClient {



    constructor() {
        this.client = new Net.Socket();
        this.client.setTimeout(DEFAULT_CONNECTION_TIMEOUT);
        this.client.setKeepAlive(false);
    }

    async openClientConnection(host, port) {
        const _this = this;

        return new Promise((res, rej) => {
            _this.client.connect(
                { port: port, host: host },
                () => res(_this.client)
            );

            _this.client.on('error', err => rej(err));
            _this.client.on('timeout', () => {
                rej('Connection timeout');
            });
        });
    }

    async write(data) {
        const _this = this;

        return new Promise((res, rej) => {
            _this.client.write(data, function(err) {
                if (err) {
                    rej(err);
                } else {
                    res(true);
                }
            });

            _this.client.on('error', err => rej(err));
        });
    }

    async readToEnd() {
        const _this = this;

        return new Promise((res, rej) => {

            const readTimeout = setTimeout(function() {
                rej('Read timeout');
            }, DEFAULT_READ_TIMEOUT);

            // The client can also receive data from the server by reading from its socket.
            _this.client.on('data', function(chunk) {
                res(chunk);

                clearTimeout(readTimeout);

                // Request an end to the connection after the data has been received.
                _this.client.end();
            });

            _this.client.on('error', err => rej(err));

            _this.client.on('end', () => {
                clearTimeout(readTimeout);
            });
        });
    }

    async close() {
        this.client.end();
        this.client.destroy();
    }

}