const express = require("express"),
    app = express(),
    corsOptions = {origin: 'https://personeltakip.adiyaman.edu.tr'},
    cors = require("cors"),
    helmet = require("helmet"),
    compress = require("http-compression")

async function start() {
    const {handler} = await import('./build/handler.js')

    app
        .options("*", cors(corsOptions))
        .use(cors(corsOptions))
        .use(
            helmet({
                contentSecurityPolicy: false,
                referrerPolicy: {policy: "strict-origin-when-cross-origin"},
                strictTransportSecurity: {preload: true},
                xDnsPrefetchControl: {allow: true},
                xFrameOptions: {action: "deny"},
                crossOriginEmbedderPolicy: {policy: "unsafe-none"},
            })
        )
        .use(compress())
        .use("/", express.static("static", {immutable: true, maxAge: 31556926000, index: false}))
        .use(handler)
        .listen(3001, () => console.log('onConnect'))
}

start()
