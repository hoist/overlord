var gulp = require('gulp');
var spawn = require('child_process').spawn;
var bunyan;
var server;
var originalEnv = process.env.NODE_ENV || "development";
gulp.task('serve', () => {
  server && server.kill();
  bunyan && bunyan.kill();
  console.log('starting server');
  server = spawn('node', ['./start.js'], {
    env: Object.assign({}, process.env, {NODE_ENV: originalEnv})
  });
  console.log('starting bunyan');

  bunyan = spawn('./node_modules/bunyan/bin/bunyan', ['--output', 'short', '--color']);
  bunyan.on('error', (err) => {
    console.log(err);
  });

  bunyan
    .stdout
    .pipe(process.stdout);
  bunyan
    .stderr
    .pipe(process.stderr);

  server
    .stdout
    .pipe(bunyan.stdin);
  server
    .stderr
    .pipe(bunyan.stdin);

  function exitHandler() {
    server && server.kill();
    bunyan && bunyan.kill();
    process.exit(0);
  }
  process.once('SIGINT', exitHandler);
});
