try {
  process.kill(10308, 'SIGKILL');
  console.log('Killed with SIGKILL');
} catch (e) {
  console.log('process.kill error:', e.code, e.message);
}
