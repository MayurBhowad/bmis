import assert from "node:assert";
import net from "node:net";
import test, { before, after } from "node:test";

import CommandExecuter from "../../src/commands/command-executer";
import Database from "../../src/database/database";
import TcpServer from "../../src/server/tcp-server";

const HOST = "127.0.0.1";
const PORT = 6380;

let tcpServer: TcpServer;

function parseResponse(
    buffer: string
): { response: string; remaining: string } | undefined {

    const lineEnd = buffer.indexOf("\r\n");

    if (lineEnd === -1) {
        return undefined;
    }

    const header = buffer.slice(0, lineEnd);

    if (header === "+OK") {
        return {
            response: "+OK",
            remaining: buffer.slice(lineEnd + 2),
        };
    }

    if (header.startsWith(":")) {
        return {
            response: header,
            remaining: buffer.slice(lineEnd + 2),
        };
    }

    if (header.startsWith("-")) {
        return {
            response: header,
            remaining: buffer.slice(lineEnd + 2),
        };
    }

    if (header === "$-1") {
        return {
            response: null as unknown as string,
            remaining: buffer.slice(lineEnd + 2),
        };
    }

    if (header.startsWith("$")) {
        const length = Number(header.slice(1));

        const start = lineEnd + 2;
        const end = start + length;

        if (buffer.length < end + 2) {
            return undefined;
        }

        return {
            response: buffer.slice(start, end),
            remaining: buffer.slice(end + 2),
        };
    }

    return undefined;
}


class TestClient {

    private socket: net.Socket;

    private buffer = "";

    private responses: string[] = [];

    private waiters: Array<{
        resolve: (value: string) => void;
        reject: (error: Error) => void;
    }> = [];

    private constructor(socket: net.Socket) {
        this.socket = socket;

        this.socket.on("data", (data: Buffer) => {
            this.buffer += data.toString();

            this.processBuffer();
        });
    }

    static connect(): Promise<TestClient> {
        return new Promise((resolve, reject) => {

            const socket = net.createConnection({
                host: HOST,
                port: PORT,
            });

            socket.once("connect", () => {
                resolve(new TestClient(socket));
            });

            socket.once("error", reject);
        });
    }

    private processBuffer(): void {

        while (true) {

            const parsed = parseResponse(this.buffer);

            if (!parsed) {
                return;
            }

            this.buffer = parsed.remaining;

            if (this.waiters.length > 0) {

                const waiter = this.waiters.shift()!;

                waiter.resolve(parsed.response);

            } else {

                this.responses.push(parsed.response);
            }
        }
    }

    writeRaw(data: string): void {
        this.socket.write(data);
    }

    send(command: string): Promise<string> {

        this.socket.write(`${command}\n`);

        if (this.responses.length > 0) {
            return Promise.resolve(
                this.responses.shift()!
            );
        }

        return new Promise((resolve, reject) => {

            this.waiters.push({
                resolve,
                reject,
            });

        });
    }

    close(): Promise<void> {

        return new Promise((resolve) => {

            this.socket.once("close", () => {
                resolve();
            });

            this.socket.end();
        });
    }
}


before(async () => {

    const database = new Database();

    const commandExecuter = new CommandExecuter(database);

    tcpServer = new TcpServer(
        commandExecuter,
        HOST,
        PORT
    );

    await tcpServer.start();
});


after(async () => {
    await tcpServer.stop();
});


test("TCP client should connect to the BMis server", async () => {

    const client = await TestClient.connect();

    await client.close();
});


test("TCP server execute SET commands", async () => {

    const client = await TestClient.connect();

    const result = await client.send(
        "SET name Mayur"
    );

    assert.equal(result, "+OK");

    await client.close();
});


test("TCP server execute GET commands", async () => {

    const client = await TestClient.connect();

    await client.send(
        "SET name Mayur"
    );

    const result = await client.send(
        "GET name"
    );

    assert.equal(result, "Mayur");

    await client.close();
});


test("TCP connection should support multiple commands", async () => {

    const client = await TestClient.connect();

    assert.equal(
        await client.send("SET name Mayur"),
        "+OK"
    );

    assert.equal(
        await client.send("GET name"),
        "Mayur"
    );

    assert.equal(
        await client.send("EXISTS name"),
        ":1"
    );

    await client.close();
});


test("TCP server handles multiple clients", async () => {

    const client1 = await TestClient.connect();

    const client2 = await TestClient.connect();

    assert.equal(
        await client1.send("SET client1 one"),
        "+OK"
    );

    assert.equal(
        await client2.send("SET client2 two"),
        "+OK"
    );

    assert.equal(
        await client1.send("GET client1"),
        "one"
    );

    assert.equal(
        await client2.send("GET client2"),
        "two"
    );

    await client1.close();

    await client2.close();
});


test("TCP server handles multiple commands received in one packet", async () => {

    const client = await TestClient.connect();

    const responses: Promise<string>[] = [];

    responses.push(client.send("SET packet one"));
    responses.push(client.send("GET packet"));
    responses.push(client.send("EXISTS packet"));

    assert.deepEqual(
        await Promise.all(responses),
        [
            "+OK",
            "one",
            ":1",
        ]
    );

    await client.close();
});


test("TCP server handles a command split across packets", async () => {
    const client = await TestClient.connect();

    client.writeRaw("SET split Ma");

    await new Promise((resolve) => {
        setTimeout(resolve, 50);
    });

    const responsePromise = client.send("yur");

    assert.equal(
        await responsePromise,
        "+OK"
    );

    assert.equal(
        await client.send("GET split"),
        "Mayur"
    );

    await client.close();
});


test("TCP server ignores empty commands", async () => {

    const client = await TestClient.connect();

    assert.equal(
        await client.send("SET empty test"),
        "+OK"
    );

    await client.close();
});