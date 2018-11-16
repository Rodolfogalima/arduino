// leitura dos dados do Arduino
const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;
var config = require('./config');
var sql = require('mssql');
var stats = require('stats-lite');

//Faz a conexão com o banco
sql.connect(config)
    .then(conn => {

        console.log("Conectado!")
              
        //-------------------------------------------------------------------------------
        // Função que registra a leitura do arduino no banco de dados na Nuvem
        function setLeitura(temperatura, umidade) {
            let fkIncubadora = 1;

            conn.query`INSERT into medicao values ( ${temperatura}, ${umidade}, ${fkIncubadora});`
                .then(() => {

                    console.log("Registro de medicão salvo!");
                }).catch(() => {

                    console.log("Erro ao registrar medicão");
                });

        }
        //-------------------------------------------------------------------------------------
        // Função que deleta os registros da tabela medicão quando for igual a 100
        function resetaMedicao() {
            conn.query`DELETE top(100) from medicao ;`
                .then(() => {

                    console.log("Registros de medicão deletados!");
                }).catch(() => {

                    console.log("Erro ao deletar medicões");
                });

        }
        //------------------------------------------------------------------
        function getEstatistica() {

            conn.query`SELECT top(100) temperatura,umidade FROM medicao;`
                .then((resultado) => {
                  

                    let temperatura = [];
                    let umidade = [];

                    for (data of resultado.recordset) {

                        temperatura.push(data.temperatura);
                        umidade.push(data.umidade);
                    }
                    
                    let estatisticas = {
                    //Estatisticas temperatura
                     mediaTemp : parseInt(stats.mean(temperatura)),
                    medianaTemp : parseInt(stats.median(temperatura)),
                    dvPdTemp : parseInt(stats.stdev(temperatura)),
                     q1Temp : parseInt(stats.percentile(temperatura, 0.25)),
                     q3Temp : parseInt(stats.percentile(temperatura, 0.75)),
                     minTemp : Math.min(...temperatura),
                     maxTemp : Math.max(...temperatura),
                    
                    //Estatisticas umidade
                    mediaUmid : parseInt(stats.mean(umidade)),
                    medianaUmid : parseInt(stats.median(umidade)),
                    dvPdUmid : parseInt(stats.stdev(umidade)),
                    q1Umid : parseInt(stats.percentile(umidade, 0.25)),
                    q3Umid : parseInt(stats.percentile(umidade, 0.75)),
                    minUmid : Math.min(...umidade),
                    maxUmid : Math.max(...umidade)
                    };
                    
                    setEstatistica(estatisticas);
                    

                }).catch(() => {

                    console.log("Erro ao gerar estatisticas");
                });

        };

        //--------------------------------------------------------------------------
        function setEstatistica(estatisticas) {
            
            conn.query`insert into estatistica values (${estatisticas.mediaTemp},
                                                       ${estatisticas.medianaTemp},
                                                       ${estatisticas.dvPdTemp},
                                                       ${estatisticas.q1Temp},
                                                       ${estatisticas.q3Temp},
                                                       ${estatisticas.minTemp},
                                                       ${estatisticas.maxTemp},
                                                       ${estatisticas.mediaUmid},
                                                       ${estatisticas.medianaUmid},
                                                       ${estatisticas.dvPdUmid},
                                                       ${estatisticas.q1Umid},
                                                       ${estatisticas.q3Umid},
                                                       ${estatisticas.minUmid},
                                                       ${estatisticas.maxUmid})`
                .then((resultado) => {
                        console.log("Estatisticas salvas!")

                }).catch(()=>{});
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

                    if (cont > 100) {
                        cont = 0;
                        setEstatistica();
                    } else {

                        const leitura = data.split(';'); // temperatura ; umidade
                        setLeitura(Number(leitura[0]), Number(leitura[1]));
                    }



                });

            }).catch(error => console.log(`Erro ao receber dados do Arduino ${error}`));
        }


        
        setConnection();

    });

