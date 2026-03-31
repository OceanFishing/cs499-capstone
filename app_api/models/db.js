const mongoose = require('mongoose');
const readline = require('readline');

const host = process.env.DB_HOST || '127.0.0.1';
const dbURI = `mongodb://${host}/travlr`;

// Delay connect to allow event listeners to register first
const connect = () => {
    setTimeout(() => mongoose.connect(dbURI), 1000);
};

// Monitor connection lifecycle events
mongoose.connection.on('connected', () => {
    console.log(`Mongoose connected to ${dbURI}`);
});

mongoose.connection.on('error', err => {
    console.log('Mongoose connection error: ', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});

// Windows-specific: relay SIGINT so graceful shutdown fires
if (process.platform === 'win32') {
    const r1 = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    r1.on('SIGINT', () => {
        process.emit('SIGINT');
    });
}

// Close connection and log the shutdown reason
const gracefulShutdown = (msg) => {
    mongoose.connection.close(() => {
        console.log(`Mongoose disconnected through ${msg}`);
    });
};

// Nodemon restart
process.once('SIGUSR2', () => {
    gracefulShutdown('nodemon restart');
    process.kill(process.pid, 'SIGUSR2');
});

// App termination (Ctrl+C)
process.on('SIGINT', () => {
    gracefulShutdown('app termination');
    process.exit(0);
});

// Container/cloud shutdown
process.on('SIGTERM', () => {
    gracefulShutdown('app shutdown');
    process.exit(0);
});

// Open the initial connection
connect();

// Load the Trip schema so it is registered with Mongoose
require('./travlr');

module.exports = mongoose;