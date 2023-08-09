let io = null;

module.exports = {
  init: (httpServer) => {
    io = require('socket.io')(httpServer, {
      cors: { // https://socket.io/docs/v4/handling-cors/
        origin: '*',
      },
    });
    return io;
  },

  getIO: () => io,
};
