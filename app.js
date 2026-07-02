const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Hello from Jenkins CD Pipeline!'));

// Only listen if the file is run directly (not required/imported by a test framework)
if (require.main === module) {
  app.listen(3000, () => console.log('Server running on port 3000'));
}

module.exports = app;

