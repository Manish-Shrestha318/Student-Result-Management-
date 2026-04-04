const http = require('http');

const endpoints = [
  '/api-docs/',
  '/api/auth/login',
  '/api/users',
  '/api/dashboard',
  '/api/chats',
  '/api/notices'
];

endpoints.forEach(path => {
  const req = http.request({ hostname: 'localhost', port: 5000, path, method: 'GET' }, res => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
      console.log(`[${res.statusCode}] ${path}`);
      if (res.statusCode >= 500) {
         console.error('Server error on', path, data);
      }
    });
  });
  req.on('error', err => console.error(path, err.message));
  req.end();
});
