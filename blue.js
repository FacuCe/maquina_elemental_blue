document.addEventListener('DOMContentLoaded', () => {

    // TRABAJO TODO EN BINARIO Y CUANDO QUIERO OPERAR CONVIERTO A DECIMAL



    //FUNCIONES Y VARIABLES ÚTILES

    let fin_del_programa = false;



    //FUNCIONES ÚTILES

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

    function ponerCeros_6_digitos(s_num) {  // Para completar el SR en octal
        while (s_num.length < 6) {
            s_num = '0' + s_num;
        };
        return s_num
    };

    function ponerCeros_4_digitos_octales(s_num) {  // Para completar el SR en octal
        while (s_num.length < 4) {
            s_num = '0' + s_num;
        };
        return s_num
    }

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

    function complemento_a_2(num_en_bin) {
        num_en_bin = ponerCeros_16bits(num_en_bin);
        let nuevo_numero = '';
        for (let i = 0; i < num_en_bin.length; i++) {
            if (num_en_bin.charAt(i) == '0') {
                nuevo_numero = nuevo_numero + '1';
            } else {
                nuevo_numero = nuevo_numero + '0';
            }
        }
        nuevo_numero = parseInt(nuevo_numero, 2);
        nuevo_numero += 1;
        nuevo_numero = nuevo_numero.toString(2);
        return ponerCeros_16bits(nuevo_numero);
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

        let a_octal = ponerCeros_6_digitos((parseInt(UM.memoria[i], 2)).toString(8));

        tr.innerHTML = `<td>${i.toString(8)}</td><td>${UM.memoria[i]}</td><td>${a_octal}</td>`;

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


            // El resultado puede estar entre -32768 y 32767

            // Caso 1: ACC (+) y dato de memoria (+)
            if ((CPU.Z).charAt(0) == '0' && (CPU.Y).charAt(0) == '0') {
                let resultado_decimal = parseInt(CPU.Z, 2) + parseInt(CPU.Y, 2);
                if (resultado_decimal > 32767) {
                    fin_del_programa = true;
                    alert('Overflow en ALU (número mayor a 32767), presione RESET para escribir otro programa');
                } else {
                    let aux1 = resultado_decimal.toString(2);
                    CPU.ALU = ponerCeros_16bits(aux1);
                    CPU.ACC = CPU.ALU;
                }
            }
            // Caso 2: ACC (+) y dato de memoria (-)
            else if ((CPU.Z).charAt(0) == '0' && (CPU.Y).charAt(0) == '1') {
                // como CPU.Y es negativo, lo paso a positivo con el complemento a 2 y se lo resto a CPU.Z
                let y_positivo = complemento_a_2(CPU.Y);
                let resultado_decimal = parseInt(CPU.Z, 2) - parseInt(y_positivo, 2);
                if (resultado_decimal >= 0) {
                    CPU.ALU = ponerCeros_16bits(resultado_decimal.toString(2));
                    CPU.ACC = CPU.ALU;
                } else {
                    CPU.ALU = complemento_a_2((-resultado_decimal).toString(2));
                    CPU.ACC = CPU.ALU;
                }
            }
            // Caso 3: ACC (-) y dato de memoria (+)
            else if ((CPU.Z).charAt(0) == '1' && (CPU.Y).charAt(0) == '0') {
                // como CPU.Z es negativo, lo paso a positivo con el complemento a 2 (lo coloco en negativo) y le sumo CPU.Y
                let z_positivo = complemento_a_2(CPU.Z);
                let resultado_decimal = - parseInt(z_positivo, 2) + parseInt(CPU.Y, 2);
                if (resultado_decimal >= 0) {
                    CPU.ALU = ponerCeros_16bits(resultado_decimal.toString(2));
                    CPU.ACC = CPU.ALU;
                } else {
                    CPU.ALU = complemento_a_2((-resultado_decimal).toString(2));
                    CPU.ACC = CPU.ALU;
                }
            }
            // Caso 4: ACC (-) y dato de memoria (-)
            else if ((CPU.Z).charAt(0) == '1' && (CPU.Y).charAt(0) == '1') {
                let y_positivo = complemento_a_2(CPU.Y);
                let z_positivo = complemento_a_2(CPU.Z);
                let resultado_decimal = - parseInt(z_positivo, 2) - parseInt(y_positivo, 2);
                if (resultado_decimal < -32768) {
                    fin_del_programa = true;
                    alert('Overflow en ALU (número menor a -32768), presione RESET para escribir otro programa');
                } else {
                    CPU.ALU = complemento_a_2((-resultado_decimal).toString(2));
                    CPU.ACC = CPU.ALU;
                }
            }
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
            for (let i = 0; i < (CPU.ALU).length; i++) {
                if ((CPU.ALU).charAt(i) == '0') {
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

            let a_octal = ponerCeros_6_digitos((parseInt(CPU.ACC, 2)).toString(8));

            //Modifico la memoria en pantalla
            document.querySelector('#cuerpo').rows[parseInt(CPU.leer_dir_IR(), 2)].cells[1].innerHTML = `${CPU.ACC}`;
            document.querySelector('#cuerpo').rows[parseInt(CPU.leer_dir_IR(), 2)].cells[2].innerHTML = `${a_octal}`;
        },

        SRJ: () => {
            CPU.ACC = ponerCeros_16bits(CPU.PC);
            CPU.PC = CPU.leer_dir_IR();
            console.log('dirección de retorno: ACC = ' + CPU.ACC)
        },

        JMA: () => {
            if ((CPU.ACC).charAt(0) == '1') {
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

    // Inicializo el SR en pantalla
    document.querySelector('#SR').innerHTML = UES.SR;



    //PROGRAMA PRINCIPAL


    // Función para cargar el SR
    document.querySelector('#form-bin').onsubmit = () => {
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

    // Funciones para seleccionar el tipo de entrada

    // Entrada en binario
    document.querySelector('#b-bin').onclick = () => {
        document.querySelector('#SR-base-texto').innerHTML = 'SR (binario):';
        document.querySelector('#SR').innerHTML = UES.SR;
        document.getElementsByName('name-placeholder')[0].placeholder = 'número de 16 bits';
        document.querySelector('#registro-sr').maxLength = "16";
        document.querySelector('#dir-mnemonico-div').className = 'col-4 d-none';

        document.querySelector('#form-bin').onsubmit = () => {
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
    };

    // Entrada en octal
    document.querySelector('#b-oct').onclick = () => {
        // Muestro el SR
        document.querySelector('#SR').innerHTML = ponerCeros_6_digitos((parseInt(UES.SR, 2)).toString(8));
        document.querySelector('#SR-base-texto').innerHTML = 'SR (octal):'
        document.getElementsByName('name-placeholder')[0].placeholder = 'número de 8 dígitos';
        document.querySelector('#registro-sr').maxLength = "6";
        document.querySelector('#dir-mnemonico-div').className = 'col-4 d-none';


        document.querySelector('#form-bin').onsubmit = () => {
            let aux = (document.querySelector('#registro-sr').value).toString(8);
            aux = ponerCeros_6_digitos(aux)

            if (aux.charAt(0) != '0' && aux.charAt(0) != '1') {
                alert('El primer dígito octal sólo puede ser 0 o 1')
            } else {
                for (let i = 0; i < aux.length; i++) {
                    if (!(aux.charAt(i) in ['0', '1', '2', '3', '4', '5', '6', '7'])) {
                        alert('Ingrese un número en octal');
                        break;
                    } else {
                        if (i == 5) {
                            aux = parseInt(aux, 8);
                            aux = aux.toString(2);

                            aux = ponerCeros_16bits(aux);

                            UES.SR = aux;

                            let a_octal = (parseInt(UES.SR, 2)).toString(8)
                            document.querySelector('#SR').innerHTML = ponerCeros_6_digitos(a_octal);
                        }
                    }
                }
            }

            return false;   //para evitar problemas con el submit
        };
    }

    // Entrada en Mnemónico
    document.querySelector('#b-mne').onclick = () => {
        // Muestro el SR
        document.querySelector('#SR').innerHTML = ponerCeros_6_digitos((parseInt(UES.SR, 2)).toString(8));
        document.querySelector('#SR-base-texto').innerHTML = 'SR:'
        document.getElementsByName('name-placeholder')[0].placeholder = 'Cod (3)';
        document.querySelector('#registro-sr').maxLength = "3";
        document.querySelector('#dir-mnemonico-div').className = 'col-4';
        document.querySelector('#dir-mnemonico').maxLength = "4";

        document.querySelector('#form-bin').onsubmit = () => {
            let cod = document.querySelector('#registro-sr').value;
            let dir = (document.querySelector('#dir-mnemonico').value).toString(8);
            dir = ponerCeros_4_digitos_octales(dir);

            let list = ['hlt', 'HLT', 'add', 'ADD', 'xor', 'XOR', 'and', 'AND', 'ior', 'IOR', 'not', 'NOT', 'lda', 'LDA', 'sta', 'STA', 'srj', 'SRJ', 'jma', 'JMA',
                'jmp', 'JMP', 'inp', 'INP', 'out', 'OUT', 'ral', 'RAL', 'csa', 'CSA', 'nop', 'NOP'];

            if (!(list.includes(cod))) {
                alert('Código de operación no válido. Ingrese todo en minúsculas o todo en mayúsculas.');
            } else {
                for (let i = 0; i < dir.length; i++) {
                    if (!(dir.charAt(i) in ['0', '1', '2', '3', '4', '5', '6', '7'])) {
                        alert('Ingrese una dirección en octal');
                        break;
                    } else {
                        if (i == 3) {
                            let index_list = list.indexOf(cod);
                            let aux = '';

                            switch (index_list) {
                                case 0:
                                case 1:
                                    aux = '0000';
                                    break;
                                case 2:
                                case 3:
                                    aux = '0001';
                                    break;
                                case 4:
                                case 5:
                                    aux = '0010';
                                    break;
                                case 6:
                                case 7:
                                    aux = '0011';
                                    break;
                                case 8:
                                case 9:
                                    aux = '0100';
                                    break;
                                case 10:
                                case 11:
                                    aux = '0101';
                                    break;
                                case 12:
                                case 13:
                                    aux = '0110';
                                    break;
                                case 14:
                                case 15:
                                    aux = '0111';
                                    break;
                                case 16:
                                case 17:
                                    aux = '1000';
                                    break;
                                case 18:
                                case 19:
                                    aux = '1001';
                                    break;
                                case 20:
                                case 21:
                                    aux = '1010';
                                    break;
                                case 22:
                                case 23:
                                    aux = '1011';
                                    break;
                                case 24:
                                case 25:
                                    aux = '1100';
                                    break;
                                case 26:
                                case 27:
                                    aux = '1101';
                                    break;
                                case 28:
                                case 29:
                                    aux = '1110';
                                    break;
                                case 20:
                                case 31:
                                    aux = '1111';
                                    break;
                                default:
                                    break;
                            };

                            dir = parseInt(dir, 8);
                            dir = dir.toString(2);
                            dir = ponerCeros_12bits(dir);
                            console.log(dir);

                            aux = aux.concat(dir);
                            console.log(aux)

                            UES.SR = aux;

                            let a_octal = (parseInt(UES.SR, 2)).toString(8)
                            document.querySelector('#SR').innerHTML = ponerCeros_6_digitos(a_octal);
                        }
                    }
                }
            }
            return false;
        }
    }


    //Muestro el contador de programa cuando abro la página
    console.log(`PC = ${CPU.PC}`);
    // Muestro el ACC en pantalla cuando abro la página
    document.querySelector('#ACC-b').innerHTML = CPU.ACC;
    document.querySelector('#ACC-o').innerHTML = ponerCeros_6_digitos((parseInt(CPU.ACC, 2)).toString(8));
    function actualizar_ACC() {
        document.querySelector('#ACC-b').innerHTML = CPU.ACC;
        document.querySelector('#ACC-o').innerHTML = ponerCeros_6_digitos((parseInt(CPU.ACC, 2)).toString(8));
    }

    // Inicializo el estilo de la fila 0, donde está ubicado el PC
    document.querySelector('#cuerpo').rows[parseInt(CPU.PC, 2)].className = 'bg-info';


    function ejecutar_programa() {
        // Borro el color celeste del PC actual
        borrar_linea_PC();

        // Muestro el ACC en pantalla
        actualizar_ACC();

        // Cargo el IR con la instruccion de la posición indicada por el PC
        CPU.IR = UM.leer_memoria(CPU.PC);

        // Incremento el PC
        incrementar_PC();

        switch (CPU.leer_cod_oper_IR()) {
            case '0000':
                CPU.HALT();
                console.log('HALT');
                console.log('Programa finalizado con HALT, para escribir un nuevo programa pulse RESET');
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

        // Muestro el ACC en pantalla
        actualizar_ACC();

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

        let a_octal = ponerCeros_6_digitos((parseInt(UES.SR, 2)).toString(8));

        //Modifico la memoria en pantalla
        document.querySelector('#cuerpo').rows[parseInt(CPU.PC, 2)].cells[1].innerHTML = `${UES.SR}`;
        document.querySelector('#cuerpo').rows[parseInt(CPU.PC, 2)].cells[2].innerHTML = `${a_octal}`;

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

        //Modifico la memoria en pantalla
        for (let i = 0; i < cantidad_de_posiciones; i++) {
            document.querySelector('tbody').rows[i].cells[1].innerHTML = '0000000000000000';
            document.querySelector('tbody').rows[i].cells[2].innerHTML = '000000';
        };

        actualizar_ACC();

        nueva_linea_PC();

        fin_del_programa = false;
    };

    b_paso_a_paso.onclick = () => {
        if (!fin_del_programa) {
            ejecutar_programa();
        } else {
            console.log('Para escribir otro programa presione RESET')
        };
    }
})