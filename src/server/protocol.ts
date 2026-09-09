import { CommandResult } from "../types";

class Protocol {
    encode(result: CommandResult): string {
        if(result === undefined) {
            return '';
        }

        if(result === null) {
            return '$-1\r\n';
        }

        if(Array.isArray(result)) {
            let response = `*${result.length}\r\n`;

            for(const item of result) {
                response += `$${item.length}\r\n`;
                response += `${item}\r\n`;
            }

            return response;
        }

        if(typeof result === 'number') {
            return `:${result}\r\n`;
        }

        if(result === 'OK') {
            return '+OK\r\n';
        }

        if(result.startsWith('ERR') || result.startsWith('WRONGTYPE')) {
            return `-${result}\r\n`;
        }

        return `$${result.length}\r\n${result}\r\n`;
    }
}

export default Protocol;