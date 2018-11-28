// leitura dos dados do Arduino
const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;
var config = require('./config');
var sql = require('mssql');
var moment = require('moment');

//Define a localidade e os formatos de data e hora
moment.updateLocale('pt-BR', {
    longDateFormat: {
        L: 'YYYY-MM-DD',
        LTS: 'HH:mm:ss',
    }
});

//Faz a conexão com o banco
sql.connect(config)
    .then(conn => {

        console.log("Conectado!")

        //-------------------------------------------------------------------------------
        /*Função que registra a leitura do arduino no banco de dados na Nuvem / Aqui fazemos
         a simulação de vários arduinos
        */ 
       function setLeitura(temperatura, umidade) {
 
            // Obtemos data e hora atual
            let date = moment().format('l');
            let time = moment().format('LTS');
            // Obtemos os campos idIncubadora de todas cadastradas
            conn.query`select idIncubadora from incubadora`
                .then((result) => {

                    //Fazemos um loop com o os arduinos cadastrados e salvamos o id na fkIncubadora da tabela medicao
                    for (let i = 0; i < result.recordset.length; i++) {

                        let fkIncubadora = result.recordset[i].idIncubadora;

                        conn.query`INSERT into medicao values ( ${temperatura}, ${umidade}, ${fkIncubadora},${date},${time});`
                            .then(() => {

                                console.log("Registro de medicão salvo!");
                               
                            }).catch((err) => {

                                console.log("Erro ao registrar medicão",err);
                               
                            });

                    }

                })
                


        }
       




        //--------------------------------------------------------------------------------------------
        function setConnection() {

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

                   
                        const leitura = data.split(';'); // temperatura ; umidade
                         setLeitura(Number(leitura[0]), Number(leitura[1]));
                    

                });

            }).catch(error => console.log(`Erro ao receber dados do Arduino ${error}`));
        }

       

    });

