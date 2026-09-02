import set from './set';
import get from './get';
import del from './del';
import exists from './exists';
import expire from './expire';
import ttl from './ttl';
import typeCmd from './type';
import incr from './incr';
import decr from './decr';
import lpush from './lpush';
import rpush from './rpush';
import lpop from './lpop';
import rpop from './rpop';
import lrange from './lrange';
import llen from './llen';
import lindex from './lindex';
import { CommandHandler } from '../types';

const commands: Record<string, CommandHandler> = {
    SET: set,
    GET: get,
    DEL: del,
    EXISTS: exists,
    EXPIRE: expire,
    TTL: ttl,
    TYPE: typeCmd,
    INCR: incr,
    DECR: decr,

    LPUSH: lpush,
    RPUSH: rpush,
    LPOP: lpop,
    RPOP: rpop,
    LRANGE: lrange,
    LLEN: llen,
    LINDEX: lindex,
};

export default commands;
