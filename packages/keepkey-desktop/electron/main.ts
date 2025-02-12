mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      'Content-Security-Policy': [
        "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: http: ws: wss:;",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval';",
        "style-src 'self' 'unsafe-inline';",
        "img-src 'self' data: https: http:;",
        "font-src 'self' data:;",
        "connect-src 'self' https: http: ws: wss:;",
        "frame-src 'self' https: http: blob:;",
        "child-src 'self' https: http: blob:;"
      ].join(' ')
    }
  })
}) 