const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
    const environment: string = process.env.NODE_ENV || 'production';
    console.log(`-Running in ${environment} environment`);

    const numCPUs: number = 2 || os.cpus().length;
    console.log(numCPUs);

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    console.log('Master process online with PID', process.pid);

    cluster.on('online', (worker: any) => {
        console.log('Worker ' + worker.process.pid + ' is [online]');
    });

    cluster.on('exit', (worker: any, code: any, signal: any) => {
        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        console.log('Starting a new worker');
        cluster.fork();
    });
} else {
    require('./index');
}
