// Aqui fica a configuração com o banco de dados
var config = {
    server: 'insensorserver.database.windows.net',
    userName: 'bandtec',
    password: ''

    , options: {
        debug: {
            packet: true,
            data: true,
            payload: true,
            token: false,
            log: true
        },
        database: 'IncubadorasDB',
        encrypt: true // for Azure users
    }
};

module.exports = config;