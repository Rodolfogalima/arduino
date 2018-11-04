// leitura dos dados do Arduino
const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;
var config = require('./config');


// Define os parametros de configuração com o banco
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

// Acesso ao banco de dados SQL Server
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

//require('events').EventEmitter.prototype._maxListeners = 100;
require('events').EventEmitter.defaultMaxListeners = 15;



// Faz a conexão com o banco com os parametros da variável config
var connection = new Connection(config);


// Função que registra a leitura do arduino no banco de dados na Núvem
function registrarLeitura(temperatura, umidade) {

    let fkIncubadora = 1;

    request = new Request("INSERT into medicao  values ( @temperatura, @umidade, @fkIncubadora);", function (err, linhas) {
        if (err) {
            console.log(`Erro ao tentar gravar no banco: ${err} `);
        } else {
            console.log(`Registro salvo com sucesso. Linhas afetadas: ${linhas}`);
        }
    });

    request.addParameter('temperatura', TYPES.Decimal, temperatura);
    request.addParameter('umidade', TYPES.Decimal, umidade);
    request.addParameter('fkIncubadora', TYPES.Decimal, fkIncubadora);

    connection.execSql(request);


}
// Função que deleta os registros da tabela medicão quando for igual a 100
function resetaMedicao() {

    request = new Request("DELETE FROM medicao where @fkIncubadora = 5;", function (err, linhas) {
        if (err) {
            console.log(`Erro ao tentar deletar no banco: ${err} `);
        } else {
            console.log(`Registro DELETADO com sucesso. Linhas afetadas: ${linhas}`);
        }
    });

    connection.execSql(request);

}



class ArduinoDataRead {

    constructor() { }

    SetConnection() {



        SerialPort.list().then(listSerialDevices => {

            let listArduinoSerial = listSerialDevices.filter(serialDevice => {
                return serialDevice.vendorId == 2341 && serialDevice.productId == 43;
            });

            if (listArduinoSerial.length != 1) {
                throw new Error("The Arduino was not connected or has many boards connceted");
            }

            console.log("Arduino found in the com %s", listArduinoSerial[0].comName);

            return listArduinoSerial[0].comName;

        }).then(arduinoCom => {

            let arduino = new SerialPort(arduinoCom, { baudRate: 9600 });

            const parser = new Readline();
            arduino.pipe(parser);
            let cont = 0;

            parser.on('data', (data) => {
                cont++;
                console.error('recebeu do arduino');

                if (cont > 100) {
                    cont = 0;
                    resetaMedicao();
                } else {

                    const leitura = data.split(';'); // temperatura ; umidade
                    registrarLeitura(Number(leitura[0]), Number(leitura[1]));
                }



            });

        }).catch(error => console.log(`Erro ao receber dados do Arduino ${error}`));
    }
}

const serial = new ArduinoDataRead();

// Evento que escuta a conexão com o banco. Esse código só rodará quando ouvir uma conexão.
connection.on('connect', function (errc) {

    serial.SetConnection();
});



module.exports.ArduinoData = { List: serial.List } 
