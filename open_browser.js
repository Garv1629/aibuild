import { exec } from 'child_process';

console.log('Launching browser to http://localhost:5173/ ...');
exec('start http://localhost:5173/', (err) => {
  if (err) console.error('Failed to open browser:', err);
  else console.log('Successfully launched browser!');
});
