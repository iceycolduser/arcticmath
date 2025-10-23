package com.mathpunch.wsproxy.ws;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.Proxy;
import java.net.URI;
import java.nio.ByteBuffer;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import okhttp3.Authenticator;
import okhttp3.Credentials;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.Route;
import okhttp3.WebSocket;
import okhttp3.WebSocketListener;
import okio.ByteString;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.socket.BinaryMessage;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.PongMessage;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.AbstractWebSocketHandler;

/**
 * Proxies messages between an incoming browser WebSocketSession and a remote WebSocket client (OkHttp).
 * Expect a "target" query parameter containing the URL-encoded target (ws:// or wss://).
 *
 * Reads proxy config from environment variables:
 *   PROXY_HOST (optional)
 *   PROXY_PORT (optional)
 *   PROXY_USER (optional)
 *   PROXY_PASS (optional)
 *
 * Usage (from client):
 *   ws://yourserver/ws-proxy?target=<url-encoded-ws-or-wss-target>
 *
 * Security: do NOT commit proxy credentials; use env vars or secret store.
 */
public class WebSocketProxyHandler extends AbstractWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(WebSocketProxyHandler.class);

    // Map browser session id -> remote WebSocket (OkHttp)
    private final Map<String, WebSocket> remoteBySession = new ConcurrentHashMap<>();

    // Optionally reuse a single OkHttpClient when no per-connection difference is needed.
    // For simplicity we build a new client per connection only if proxy settings are present.
    private OkHttpClient buildClient() {
        String host = System.getenv("PROXY_HOST");
        String portS = System.getenv("PROXY_PORT");
        String user = System.getenv("PROXY_USER");
        String pass = System.getenv("PROXY_PASS");

        OkHttpClient.Builder b = new OkHttpClient.Builder();

        if (host != null && !host.isEmpty() && portS != null && !portS.isEmpty()) {
            int port;
            try {
                port = Integer.parseInt(portS);
            } catch (NumberFormatException e) {
                log.warn("Invalid PROXY_PORT '{}', ignoring proxy", portS);
                return b.build();
            }

            Proxy proxy = new Proxy(Proxy.Type.HTTP, new InetSocketAddress(host, port));
            b.proxy(proxy);

            if (user != null && !user.isEmpty()) {
                b.proxyAuthenticator(new Authenticator() {
                    @Override
                    public Request authenticate(Route route, Response response) throws IOException {
                        String credential = Credentials.basic(user, pass == null ? "" : pass);
                        return response.request().newBuilder()
                                .header("Proxy-Authorization", credential)
                                .build();
                    }
                });
            }
        }

        return b.build();
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        URI uri = session.getUri();
        if (uri == null) {
            session.close(CloseStatus.BAD_DATA);
            return;
        }

        String target = extractTargetFromQuery(uri.getRawQuery());
        if (target == null || target.isEmpty()) {
            session.close(CloseStatus.BAD_DATA.withReason("Missing 'target' query parameter"));
            return;
        }

        OkHttpClient client = buildClient();

        Request req = new Request.Builder().url(target).build();

        WebSocketListener listener = new WebSocketListener() {
            @Override
            public void onOpen(WebSocket webSocket, Response response) {
                log.info("Remote WebSocket opened for session {}", session.getId());
                remoteBySession.put(session.getId(), webSocket);
            }

            @Override
            public void onMessage(WebSocket webSocket, String text) {
                try {
                    if (session.isOpen()) {
                        session.sendMessage(new TextMessage(text));
                    }
                } catch (IOException e) {
                    log.warn("Failed to send text to browser session {}, closing both", session.getId(), e);
                    safeCloseBoth(session, webSocket);
                }
            }

            @Override
            public void onMessage(WebSocket webSocket, ByteString bytes) {
                try {
                    if (session.isOpen()) {
                        ByteBuffer buf = ByteBuffer.wrap(bytes.toByteArray());
                        session.sendMessage(new BinaryMessage(buf));
                    }
                } catch (IOException e) {
                    log.warn("Failed to send binary to browser session {}, closing both", session.getId(), e);
                    safeCloseBoth(session, webSocket);
                }
            }

            @Override
            public void onClosing(WebSocket webSocket, int code, String reason) {
                log.info("Remote is closing for session {}: {} {}", session.getId(), code, reason);
                safeCloseBoth(session, webSocket);
            }

            @Override
            public void onClosed(WebSocket webSocket, int code, String reason) {
                log.info("Remote closed for session {}: {} {}", session.getId(), code, reason);
                safeCloseBoth(session, webSocket);
            }

            @Override
            public void onFailure(WebSocket webSocket, Throwable t, Response response) {
                log.warn("Remote failure for session {}: {}", session.getId(), t.getMessage(), t);
                safeCloseBoth(session, webSocket);
            }
        };

        // Initiate the remote WebSocket connection. OkHttp performs networking on its own threads.
        WebSocket remote = client.newWebSocket(req, listener);
        // Put into map so handler methods can reference it immediately; listener.onOpen will also (re)put
        remoteBySession.put(session.getId(), remote);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        WebSocket remote = remoteBySession.get(session.getId());
        if (remote != null) {
            boolean ok = remote.send(message.getPayload());
            if (!ok) {
                log.warn("Failed to send text to remote for session {}", session.getId());
            }
        } else {
            log.warn("No remote websocket for session {} when sending text", session.getId());
            session.close(CloseStatus.SERVER_ERROR.withReason("Remote not connected"));
        }
    }

    @Override
    protected void handleBinaryMessage(WebSocketSession session, BinaryMessage message) throws Exception {
        WebSocket remote = remoteBySession.get(session.getId());
        if (remote != null) {
            ByteBuffer b = message.getPayload();
            byte[] arr = new byte[b.remaining()];
            b.get(arr);
            boolean ok = remote.send(ByteString.of(arr));
            if (!ok) {
                log.warn("Failed to send binary to remote for session {}", session.getId());
            }
        } else {
            log.warn("No remote websocket for session {} when sending binary", session.getId());
            session.close(CloseStatus.SERVER_ERROR.withReason("Remote not connected"));
        }
    }

    @Override
    public void handlePongMessage(WebSocketSession session, PongMessage message) throws Exception {
        // currently ignored; could forward to remote if needed
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        log.warn("Transport error for session {}", session.getId(), exception);
        WebSocket remote = remoteBySession.remove(session.getId());
        if (remote != null) {
            try {
                remote.close(1011, "Transport error");
            } catch (Exception ignored) {}
        }
        if (session.isOpen()) {
            session.close(CloseStatus.SERVER_ERROR.withReason("Transport error"));
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        log.info("Browser session {} closed: {}", session.getId(), status);
        WebSocket remote = remoteBySession.remove(session.getId());
        if (remote != null) {
            try {
                remote.close(status.getCode(), status.getReason());
            } catch (Exception ignored) {}
        }
    }

    private void safeCloseBoth(WebSocketSession session, WebSocket remote) {
        try {
            if (remote != null) remote.close(1000, "closing");
        } catch (Exception ignored) {}
        try {
            if (session != null && session.isOpen()) session.close(CloseStatus.NORMAL);
        } catch (Exception ignored) {}
        if (session != null) remoteBySession.remove(session.getId());
    }

    private String extractTargetFromQuery(String rawQuery) {
        if (rawQuery == null) return null;
        for (String part : rawQuery.split("&")) {
            int eq = part.indexOf('=');
            if (eq > 0) {
                String name = part.substring(0, eq);
                String value = part.substring(eq + 1);
                if ("target".equals(name)) {
                    try {
                        return java.net.URLDecoder.decode(value, "UTF-8");
                    } catch (Exception e) {
                        return value;
                    }
                }
            }
        }
        return null;
    }
}
