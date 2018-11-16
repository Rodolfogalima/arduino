const config = {
    user: 'bandtec',
    password: 'Rodolfolink911',
    server: 'insensorserver.database.windows.net', // You can use 'localhost\\instance' to connect to named instance
    database: 'IncubadorasDB',

    options: {
        encrypt: true // Use this if you're on Windows Azure
    }
}

module.exports = config;