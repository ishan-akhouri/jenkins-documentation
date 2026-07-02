const http = require('http');
const server = require('../app');

test('GET / returns 200', (done) => {
  server.listen(0, () => {
    const { port } = server.address();
    http.get(`http://localhost:${port}/`, (res) => {
      expect(res.statusCode).toBe(200);
      server.close(done);
    });
  });
});
