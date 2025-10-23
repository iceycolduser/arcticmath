// Dynamic uv.config.js route — add this to index.js (after app/server are created)
const BARE_URL = process.env.BARE_URL || 'https://vercbareserver.vercel.app/seal/';

app.get('/uv/uv.config.js', (req, res) => {
  res.type('application/javascript');
  // Serve a small JS file that sets the __uv$config object. We keep Ultraviolet.codec.xor references unquoted
  // so the runtime will resolve them the same way as the original static file.
  res.send(`self.__uv$config = {
    prefix: '/service/',
    bare: ${JSON.stringify(BARE_URL)},
    encodeUrl: Ultraviolet.codec.xor.encode,
    decodeUrl: Ultraviolet.codec.xor.decode,
    handler: '/uv/uv.handler.js',
    client: '/uv/uv.client.js',
    bundle: '/uv/uv.bundle.js',
    config: '/uv/uv.config.js',
    sw: '/uv/uv.sw.js',
};`);
});
