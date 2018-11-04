// Aqui fica a configuração com o banco de dados
var config = {
    server: 'tbtt.database.windows.net',
    userName: 'bandtec',
    password: 'TBTTprojeto5'

    , options: {
        debug: {
            packet: true,
            data: true,
            payload: true,
            token: false,
            log: true
        },
        database: 'TheBigTecTheory',
        encrypt: true // for Azure users
    }
};

module.exports = config;