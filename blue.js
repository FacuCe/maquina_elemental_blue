document.addEventListener('DOMContentLoaded', () => {

    // TRABAJO TODO EN BINARIO Y CUANDO QUIERO OPERAR CONVIERTO A DECIMAL


    //FUNCIONES Y VARIABLES ÚTILES

    let fin_del_programa = false;

    function ponerCeros_16bits(s_num) {
        while (s_num.length < 16) {
            s_num = '0' + s_num;
        };
        return s_num
    };

    function ponerCeros_12bits(s_num) {
        while (s_num.length < 12) {
            s_num = '0' + s_num;
        };
        return s_num
    };

    function incrementar_PC() {
        CPU.Z = CPU.PC;
        CPU.Y = CPU.R1;
        let aux1 = parseInt(CPU.PC, 2);
        let aux2 = parseInt(CPU.R1, 2);
        let resultado_temporal = (aux1 + aux2).toString(2);
        CPU.PC = ponerCeros_12bits(resultado_temporal);
        CPU.ALU = ponerCeros_16bits(resultado_temporal);
        console.log(`PC = ${CPU.PC}`);
    };



    // UNIDAD DE MEMORIA

    const cantidad_de_posiciones = 4096; // en octal: 7777

    let UM = {
        MAR: '000000000000',
        MBR: '0000000000000000',
        memoria: new Array(cantidad_de_posiciones),

        set_MAR: (direccion) => {
            UM.MAR = ponerCeros_12bits(direccion);
        },
        get_MAR: () => {
            return UM.MAR;
        },
        set_MBR: (palabra) => {
            UM.MBR = ponerCeros_16bits(palabra);
        },
        get_MBR: () => {
            return UM.MBR;
        },

        // Métodos para leer y escribir en la memoria

        leer_memoria: (direccion) => {
            UM.set_MAR(direccion);
            UM.set_MBR(UM.memoria[parseInt(UM.MAR, 2)]);
            return UM.MBR;
        },
        escribir_memoria: (direccion, palabra) => {
            UM.set_MAR(direccion);
            UM.set_MBR(palabra);
            UM.memoria[parseInt(UM.MAR, 2)] = UM.MBR;
        },
        reset_memoria: () => {
            UM.set_MAR('000000000000');
            UM.set_MBR('0000000000000000');
            for (let i = 0; i < UM.memoria.length; i++) {
                UM.memoria[i] = '0000000000000000';
            };
        }
    }

    // Inicializo la estructura de la memoria (RAM de 4096x16)
    for (let i = 0; i < UM.memoria.length; i++) {
        UM.memoria[i] = '0000000000000000';
    };

    // Inicializo la tabla del HTML

    for (let i = 0; i < cantidad_de_posiciones; i++) {
        let tr = document.createElement('tr');
        tr.innerHTML = `<td>${i.toString(8)}</td><td>${UM.memoria[i]}</td>`;

        document.querySelector('#cuerpo').append(tr);
    }

    // Función para ver los 12 bits más bajos

    function bits_mas_bajos_12(nro_16_bits) {
        let direccion = '';
        for (let i = 4; i < 16; i++) {
            direccion = direccion + nro_16_bits.charAt(i);
        };
        return direccion;
    };



    // UNIDAD DE PROCESAMIENTO CENTRAL (CPU)

    let CPU = {
        ACC: '0000000000000000',
        IR: '0000000000000000',
        PC: '000000000000',
        R1: '1',
        Z: '0000000000000000',
        Y: '0000000000000000',
        ALU: '0000000000000000',

        leer_dir_IR: () => {
            let direccion_IR = '';
            for (let i = 4; i < 16; i++) {
                direccion_IR = direccion_IR + CPU.IR.charAt(i);
            };
            return direccion_IR.toString(2);
        },
        leer_cod_oper_IR: () => {
            let cod_op_IR = '';
            for (let i = 0; i < 4; i++) {
                cod_op_IR = cod_op_IR + CPU.IR.charAt(i);
            };
            return cod_op_IR.toString(2);
        },

        // INSTRUCCIONES

        HALT: () => {
            fin_del_programa = true;
        },

        ADD: () => {
            CPU.Z = CPU.ACC;
            CPU.Y = UM.leer_memoria(CPU.leer_dir_IR());
            CPU.ALU = (parseInt(CPU.Z, 2) + parseInt(CPU.Y, 2)).toString(2);
            CPU.ALU = ponerCeros_16bits(CPU.ALU);
            CPU.ACC = CPU.ALU;
        },

        XOR: () => {
            CPU.Z = CPU.ACC;
            CPU.Y = UM.leer_memoria(CPU.leer_dir_IR());
            let aux = '';
            for (let i = 0; i < 16; i++) {
                if (CPU.Z.charAt(i) == CPU.Y.charAt(i)) {
                    aux = aux + '0';
                } else {
                    aux = aux + '1';
                }
            }
            CPU.ALU = aux;
            CPU.ACC = CPU.ALU;
        },

        AND: () => {
            CPU.Z = CPU.ACC;
            CPU.Y = UM.leer_memoria(CPU.leer_dir_IR());
            let aux = '';
            for (let i = 0; i < 16; i++) {
                if (CPU.Z.charAt(i) == '1' && CPU.Y.charAt(i) == '1') {
                    aux = aux + '1';
                } else {
                    aux = aux + '0';
                }
            }
            CPU.ALU = aux;
            CPU.ACC = CPU.ALU;
        },

        IOR: () => {
            CPU.Z = CPU.ACC;
            CPU.Y = UM.leer_memoria(CPU.leer_dir_IR());
            let aux = '';
            for (let i = 0; i < 16; i++) {
                if (CPU.Z.charAt(i) == '1' || CPU.Y.charAt(i) == '1') {
                    aux = aux + '1';
                } else {
                    aux = aux + '0';
                }
            }
            CPU.ALU = aux;
            CPU.ACC = CPU.ALU;
        },

        NOT: () => {
            CPU.Z = CPU.ACC;
            CPU.ALU = CPU.Z;
            let auxiliar = '';
            for (let i = 0; i < CPU.ALU.length; i++) {
                if (CPU.ALU.charAt(i) == '0') {
                    auxiliar = auxiliar + '1';
                } else {
                    auxiliar = auxiliar + '0';
                }
            };
            CPU.ALU = auxiliar;
            CPU.ACC = CPU.ALU;
        },

        LDA: () => {
            CPU.ACC = UM.leer_memoria(CPU.leer_dir_IR());
        },

        STA: () => {
            UM.escribir_memoria(CPU.leer_dir_IR(), CPU.ACC);

            //Modifico la memoria en pantalla
            document.querySelector('#cuerpo').rows[parseInt(CPU.leer_dir_IR(), 2)].cells[1].innerHTML = `${CPU.ACC}`;
        },

        SRJ: () => {
            CPU.ACC = CPU.PC;
            CPU.ACC = ponerCeros_16bits(CPU.ACC);
            CPU.PC = CPU.leer_dir_IR();
            console.log('dirección de retorno: ACC = ' + CPU.ACC)
        },

        JMA: () => {
            if (CPU.ACC.charAt(0) == '1') {
                CPU.PC = CPU.leer_dir_IR();
            }
        },

        JMP: () => {
            CPU.PC = CPU.leer_dir_IR();
        },

        // INP
        // OUT

        RAL: () => {
            CPU.Z = CPU.ACC;
            let aux = '';
            for (let i = 1; i < 16; i++) {
                aux = aux + CPU.Z.charAt(i);
            };
            CPU.ALU = aux + CPU.Z.charAt(0);
            CPU.ACC = CPU.ALU;
            console.log('ACC = ' + CPU.ACC)
        },

        CSA: () => {
            CPU.ACC = UES.SR;
            console.log('ACC = ' + CPU.ACC)
        },

        NOP: () => {
            console.log('Se ejecutó la instrucción NOP');
        },
    };



    //UNIDAD DE ENTRADA SALIDA

    let UES = {
        SR: '0000000000000000',
    };

    document.querySelector('#SR').innerHTML = UES.SR;



    //PROGRAMA PRINCIPAL


    document.querySelector('form').onsubmit = () => {
        // Envío el SR
        let aux = (document.querySelector('#registro-sr').value).toString(2);
        aux = ponerCeros_16bits(aux);

        for (let i = 0; i < aux.length; i++) {
            if (aux.charAt(i) == '0' || aux.charAt(i) == '1') {
                if (i == 15) {
                    UES.SR = aux;
                    document.querySelector('#SR').innerHTML = UES.SR;
                }
                continue;
            } else {
                alert('Ingrese un número en binario!')
                break;
            }
        }

        return false;   //para evitar problemas con el submit
    };

    console.log(`PC = ${CPU.PC}`);  //Muestro el contador cuando abro la página

    // Inicializo el estilo de la fila 0, donde está ubicado el PC
    document.querySelector('#cuerpo').rows[parseInt(CPU.PC, 2)].className = 'bg-info';


    function ejecutar_programa() {
        // Borro el color celeste del PC actual
        borrar_linea_PC();

        // Cargo el IR con la instruccion de la posición indicada por el PC
        CPU.IR = UM.leer_memoria(CPU.PC);

        // Incremento el PC
        incrementar_PC();

        switch (CPU.leer_cod_oper_IR()) {
            case '0000':
                CPU.HALT();
                console.log('HALT')
                break;
            case '0001':
                CPU.ADD();
                console.log('ADD')
                break;
            case '0010':
                CPU.XOR();
                console.log('XOR')
                break;
            case '0011':
                CPU.AND();
                console.log('AND')
                break;
            case '0100':
                CPU.IOR();
                console.log('IOR')
                break;
            case '0101':
                CPU.NOT();
                console.log('NOT')
                break;
            case '0110':
                CPU.LDA();
                console.log('LDA')
                break;
            case '0111':
                CPU.STA();
                console.log('STA')
                break;
            case '1000':
                CPU.SRJ();
                console.log('SRJ')
                break;
            case '1001':
                CPU.JMA();
                console.log('JMA')
                break;
            case '1010':
                CPU.JMP();
                console.log('JMP')
                break;
            case '1011':
                //INPUT
                console.log('INP')
                break;
            case '1100':
                //OUTPUT
                console.log('OUT')
                break;
            case '1101':
                CPU.RAL();
                console.log('RAL')
                break;
            case '1110':
                CPU.CSA();
                console.log('CSA')
                break;
            case '1111':
                CPU.NOP();
                console.log('NOP')
                break;
            default:
                console.log('Campo de operación no reconocido')
                break;
        };

        // Pinto de color celeste el PC actual
        nueva_linea_PC();
    };


    // Funciones para borrar o pintar la línea donde se encuentra el PC
    function borrar_linea_PC() {
        let aux = document.querySelector('#cuerpo').rows[parseInt(CPU.PC, 2)];
        aux.className = '';
    }
    function nueva_linea_PC() {
        let aux = document.querySelector('#cuerpo').rows[parseInt(CPU.PC, 2)];
        aux.className = 'bg-info';
    }


    // Funcionalidad de cada botón
    const b_start = document.querySelector('#start');
    const b_stop = document.querySelector('#stop');
    const b_loadpc = document.querySelector('#loadpc');
    const b_deposite = document.querySelector('#deposite');
    const b_examine = document.querySelector('#examine');
    const b_reset = document.querySelector('#reset');
    const b_paso_a_paso = document.querySelector('#paso-a-paso');

    b_start.onclick = () => {
        while (!fin_del_programa) {
            ejecutar_programa();
        }
        console.log('Fin del programa')
    }

    b_stop.onclick = () => {
        fin_del_programa = true;
        console.log('El programa se detuvo con STOP');
    }

    b_loadpc.onclick = () => {
        borrar_linea_PC();
        CPU.PC = bits_mas_bajos_12(UES.SR);
        console.log('PC = ' + CPU.PC);
        nueva_linea_PC();
    };

    b_deposite.onclick = () => {
        borrar_linea_PC();

        UM.escribir_memoria(CPU.PC, UES.SR);

        //Modifico la memoria en pantalla
        document.querySelector('#cuerpo').rows[parseInt(CPU.PC, 2)].cells[1].innerHTML = `${UES.SR}`;

        incrementar_PC();
        nueva_linea_PC();
    };

    b_examine.onclick = () => {
        borrar_linea_PC();
        CPU.IR = UM.leer_memoria(CPU.PC);
        incrementar_PC();
        nueva_linea_PC();
    };

    b_reset.onclick = () => {
        borrar_linea_PC();

        UM.reset_memoria();

        CPU.ACC = '0000000000000000';
        CPU.IR = '0000000000000000';
        CPU.PC = '000000000000';
        CPU.Z = '0000000000000000';
        CPU.Y = '0000000000000000';
        CPU.ALU = '0000000000000000';

        UM.MAR = '000000000000';
        UM.MBR = '0000000000000000';

        UES.SR = '0000000000000000';

        //Modifico la memoria en pantalla
        for (let i = 0; i < cantidad_de_posiciones; i++) {
            document.querySelector('tbody').rows[i].cells[1].innerHTML = '0000000000000000';
        }

        //Reseteo a cero el SR en pantalla
        document.querySelector('#SR').innerHTML = '0000000000000000';

        nueva_linea_PC();

        fin_del_programa = false;
    };

    b_paso_a_paso.onclick = () => {
        if (!fin_del_programa) {
            ejecutar_programa();
        } else {
            console.log('Fin del programa')
        };
    }



    // PRUEBAS


    //PRUEBA DEL ADD
    /*
    CPU.ACC = '0000000000000001';
    CPU.IR = '0000000000000111';
    UM.escribir_memoria('000000000111', '0000000000000011');

    console.log(CPU.ACC)
    console.log(CPU.Z)
    console.log(CPU.Y)
    console.log(CPU.ALU)

    CPU.ADD();

    console.log(CPU.ACC)
    console.log(CPU.Z)
    console.log(CPU.Y)
    console.log(CPU.ALU)
    */


    //PRUEBA DEL XOR
    /* 
    CPU.ACC = '1000000001000001';
    CPU.IR = '0000000000000111';
    UM.escribir_memoria('000000000111', '1100000000001111');
    console.log(CPU.ACC);
    console.log(CPU.ALU)

    CPU.XOR();
    console.log(CPU.ACC)
    console.log(CPU.ALU)
    */


    //PRUEBA DEL AND
    /* 
    CPU.ACC = '1000000001000001';
    CPU.IR = '0000000000000111';
    UM.escribir_memoria('000000000111', '1100000000001111');
    console.log(CPU.ACC);
    console.log(CPU.ALU)

    CPU.AND();
    console.log(CPU.ACC)
    console.log(CPU.ALU)
    */


    //PRUEBA DEL IOR
    /*     
    CPU.ACC = '1000000001000001';
    CPU.IR = '0000000000000111';
    UM.escribir_memoria('000000000111', '1100000000001111');
    console.log(CPU.ACC);
    console.log(CPU.ALU)

    CPU.IOR();
    console.log(CPU.ACC)
    console.log(CPU.ALU)
    */


    //PRUEBA DEL NOT
    /*
    CPU.ACC = '0000000011001001';

    console.log(CPU.ACC);

    CPU.NOT();
    
    console.log(CPU.ACC);
    */


    //PRUEBA DEL LDA
    /*
    CPU.IR = '0000000000000111';
    UM.escribir_memoria('000000000111', '1100000000001111');
    console.log(CPU.ACC);

    CPU.LDA();
    console.log(CPU.ACC);
    */


    //PRUEBA DEL STA
    /*
    CPU.ACC = '1111111111000000'
    CPU.IR = '0000000000000111';
    UM.escribir_memoria('000000000111', '1100000000001111');
    console.log(UM.leer_memoria('000000000111'));


    CPU.STA();
    console.log(UM.leer_memoria('000000000111'));
    */


    //PRUEBA DEL SRJ
    /*
    CPU.ACC = '1111111111000000';
    CPU.PC = '000000000111';
    CPU.IR = '0000000001000000';
    console.log(CPU.ACC);
    console.log(CPU.PC);
    console.log(CPU.IR);

    CPU.SRJ();
    console.log(CPU.ACC);
    console.log(CPU.PC);
    */


    //PRUEBA DEL JMA
    /*
    CPU.ACC = '1000000000000000';
    CPU.IR = '0000000000011000';
    CPU.PC = '000000000001';
    console.log(CPU.PC)

    CPU.JMA();

    console.log(CPU.PC);    //cambia el PC porque el ACC empieza con 1
    */


    //PRUEBA DEL JMP
    /*
    CPU.PC = '000000110010';
    CPU.IR = '0000000010000001';
    console.log(CPU.PC);

    CPU.JMP();
    console.log(CPU.PC);
    */


    //PRUEBA DEL RAL
    /*
    CPU.ACC = '0000000100010011';
    console.log(CPU.ACC);

    CPU.RAL();
    console.log(CPU.ACC);
    */



})