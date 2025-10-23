self.__uv$config = {
    prefix: '/assignments/',
    // Point the client-side Ultraviolet config at your external bare server.
    // Include the trailing slash and the same path the bare server expects (/seal/ used by the repo)
    bare: 'https://vercbareserver.vercel.app/seal/',
    encodeUrl: Ultraviolet.codec.xor.encode,
    decodeUrl: Ultraviolet.codec.xor.decode,
    handler: '/wk/wk1.js', // handler
    bundle: '/wk/wk2.js', // bundle
    config: '/wk/wk3.js', // config
    sw: '/wk/wk4.js', // sw
};
