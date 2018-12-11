const config = {
    user: 'lucas',
    password: 'Projetosensor2',
    server: 'projetosensor.database.windows.net', // You can use 'localhost\\instance' to connect to named instance
    database: 'lucasdatabase',

    options: {
        encrypt: true // Use this if you're on Windows Azure
    }
}

module.exports = config;