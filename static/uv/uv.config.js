self.__uv$config = {
    prefix: '/service/',
    // The SW-side Ultraviolet config also needs to know the bare host so it will construct websocket URLs
    bare: 'https://vercbareserver.vercel.app/seal/',
    encodeUrl: Ultraviolet.codec.xor.encode,
    decodeUrl: Ultraviolet.codec.xor.decode,
    handler: '/uv/uv.handler.js',
    client: '/uv/uv.client.js',
    bundle: '/uv/uv.bundle.js',
    config: '/uv/uv.config.js',
    sw: '/uv/uv.sw.js',
};
