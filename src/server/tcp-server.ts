import * as net from 'net';
import CommandExecuter from '../commands/command-executer';

class TcpServer {
    private server: net.Server;
    private commandExecuter: CommandExecuter;
    private host: string;
    private port: number;

    constructor(commandExecuter: CommandExecuter, host: string = '127.0.0.1', port: number = 6379) {
        this.commandExecuter = commandExecuter;
        this.host = host;
        this.port = port;

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

        if (result === undefined) {
            return;
        }

        socket.write(`${this.formatResult(result)}\n`);
    }

    private formatResult(result: Exclude<ReturnType<CommandExecuter['execute']>, undefined>): string {
        if(result === null) {
            return '(nil)';
        }

        if(Array.isArray(result)) {
            return result.join('\n');
        }

        return String(result);
    }

    start(): void {
        this.server.listen(this.port, this.host, () => {
            console.log(`BMis TCP server is running on ${this.host}:${this.port}`);
        });
    }

    stop(): void {
        this.server.close(() => {
            console.log(`BMis TCP server is stopped`);
        });
    }
}

export default TcpServer;