module.exports = {
    SET: require('./set'),
    GET: require('./get'),
    DEL: require('./del'),
    EXISTS: require('./exists'),
    EXPIRE: require('./expire'),
    TTL: require('./ttl'),
    TYPE: require('./type'),
    INCR: require('./incr'),
    DECR: require('./decr'),

    LPUSH: require('./lpush'),
    RPUSH: require('./rpush'),
    LPOP: require('./lpop'),
    RPOP: require('./rpop'),
    LRANGE: require('./lrange'),
    LLEN: require('./llen'),
    LINDEX: require('./lindex'),
};