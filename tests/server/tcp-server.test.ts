import assert from "node:assert";
import net from "node:net";
import test, { before, after } from "node:test";

import CommandExecuter from "../../src/commands/command-executer";
import Database from "../../src/database/database";
import TcpServer from "../../src/server/tcp-server";

const HOST = "127.0.0.1";
const PORT = 6380;

let tcpServer: TcpServer;

before(() => {
    const database = new Database();
    const commmandExecuter = new CommandExecuter(database);

    tcpServer = new TcpServer(commmandExecuter, HOST, PORT);
    return tcpServer.start();
});

after(() => {
    return tcpServer.stop();
});

function connectClient(): Promise<net.Socket> {
    return new Promise((resolve, reject) => {
        const socket = net.createConnection({ host: HOST, port: PORT });

        socket.once("connect", () => resolve(socket));

        socket.once("error", reject);
    });
}

function sendCommand(socket: net.Socket, command: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const onData = (data: Buffer) => {
            socket.off("error", onError);
            resolve(data.toString().trim());
        };

        const onError = (error: Error) => {
            socket.off("data", onData);
            reject(error);
        };

        socket.once("data", onData);
        socket.once("error", onError);

        socket.write(`${command}\n`);

    });
}

function closeClient(socket: net.Socket): Promise<void> {
    return new Promise((resolve) => {
        socket.once("close", () => resolve());

        socket.end();
    });
}

test("TCP client should connected to the BMis server", async () => {
    const socket = await connectClient();

    assert.equal(socket.readyState, "open");
    await closeClient(socket);
});

test("TCP server execute SET commands", async () => {
    const socket = await connectClient();

    const result = await sendCommand(socket, "SET name Mayur");
    assert.equal(result, "OK");
    await closeClient(socket);
});

test("TCP server execute GET commands", async () => {
    const socket = await connectClient();

    await sendCommand(socket, "SET name Mayur");

    const result = await sendCommand(socket, "GET name");
    assert.equal(result, "Mayur");
    await closeClient(socket);
});

test("TCP connection should support multiple commands", async () => {
    const socket = await connectClient();

    assert.equal(await sendCommand(socket, "SET name Mayur"), "OK");
    assert.equal(await sendCommand(socket, "GET name"), "Mayur");
    assert.equal(await sendCommand(socket, "EXISTS name"), "1");
    await closeClient(socket);
});

test("TCP server handles multiple clients", async () => {
    const client1 = await connectClient();
    const client2 = await connectClient();

    assert.equal(await sendCommand(client1, "SET client1 one"), "OK");
    assert.equal(await sendCommand(client1, "SET client2 two"), "OK");

    assert.equal(await sendCommand(client2, "GET client1"), "one");
    assert.equal(await sendCommand(client2, "GET client2"), "two");

    await closeClient(client1);
    await closeClient(client2);
});

test("TCP server handles multiple commands received in one packet", async () => {
    const socket = await connectClient();

    const response: string[] = [];

    const responsePromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error("Timed out waiting for response"));
        }, 1000);

        socket.on("data", (data: Buffer) => {
            const lines = data.toString().split("\n").filter(Boolean);

            response.push(...lines);

            if (lines.length === 3) {
                clearTimeout(timeout);
                resolve();
            }
        });
    });
    socket.write('SET packet one\nGET packet\nEXISTS packet\n');

    await responsePromise;

    assert.deepEqual(response, ["OK", "one", "1"]);

    await closeClient(socket);
});

test('TCP server handles a command split across packets', async () => {
    const socket = await connectClient();

    const responsePromise = new Promise<string>((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('Timed out waiting for TCP response'));
        }, 1000);

        socket.once('data', (data: Buffer) => {
            clearTimeout(timeout);
            resolve(data.toString().trim());
        });
    });

    socket.write('SET split Ma');

    await new Promise((resolve) => {
        setTimeout(resolve, 50);
    });

    socket.write('yur\n');

    const result = await responsePromise;

    assert.equal(result, 'OK');

    await closeClient(socket);
});


test("TCP server ignores empty commands", async () => {
    const socket = await connectClient();

    socket.write('\n');
    await new Promise(resolve => setTimeout(resolve, 50));

    assert.equal(socket.destroyed, false);

    await closeClient(socket);
});