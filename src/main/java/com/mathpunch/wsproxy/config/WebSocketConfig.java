package com.mathpunch.wsproxy.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import com.mathpunch.wsproxy.ws.WebSocketProxyHandler;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final WebSocketProxyHandler proxyHandler = new WebSocketProxyHandler();

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // Exposes endpoint: /ws-proxy
        registry.addHandler(proxyHandler, "/ws-proxy")
                .setAllowedOrigins("*"); // tighten in prod
    }
}
