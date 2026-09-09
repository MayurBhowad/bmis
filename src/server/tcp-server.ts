import Protocol from './protocol';
import * as net from 'net';
import CommandExecuter from '../commands/command-executer';

class TcpServer {
    private server: net.Server;
    private commandExecuter: CommandExecuter;
    private host: string;
    private port: number;
    private protocol: Protocol;

    constructor(commandExecuter: CommandExecuter, host: string = '127.0.0.1', port: number = 6379) {
        this.commandExecuter = commandExecuter;
        this.host = host;
        this.port = port;
        this.protocol = new Protocol();

        this.server = net.createServer((socket: net.Socket) => {
            this.handleConnection(socket);
        });
    }

    private handleConnection(socket: net.Socket): void {
        console.log(`Client connected: ${socket.remoteAddress}:${socket.remotePort}`);
        let buffer = '';

        socket.on('data', (data: Buffer) => {
            buffer += data.toString();
            const lines = buffer.split('\n');

            buffer = lines.pop() ?? '';

            for (const line of lines) {
                this.handleCommand(socket, line);
            }
        });

        socket.on('close', () => {
            console.log(`Client disconnected: ${socket.remoteAddress}:${socket.remotePort}`);
        });

        socket.on('error', (error: Error) => {
            console.error(`Socket error: ${error.message}`);
        });
    }

    private handleCommand(socket: net.Socket, input: string): void {
        const result = this.commandExecuter.execute(input);

        const response = this.protocol.encode(result);

        if (response === '') {
            return;
        }

        socket.write(response);
    }

    start(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.server.once('error', reject);
    
            this.server.listen(this.port, this.host, () => {
                console.log(
                    `BMIS TCP server listening on ${this.host}:${this.port}`
                );
    
                resolve();
            });
        });
    }

    stop(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.server.close((error) => {
                if (error) {
                    reject(error);
                    return;
                }
    
                console.log('BMIS TCP server stopped');
                resolve();
            });
        });
    }
}

export default TcpServer;