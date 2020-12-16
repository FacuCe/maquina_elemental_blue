document.addEventListener('DOMContentLoaded', () => {

    // TRABAJO TODO EN BINARIO Y CUANDO QUIERO OPERAR CONVIERTO A DECIMAL


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




    // UNIDAD DE MEMORIA

    const cantidad_de_posiciones = 4096; // en octal: 7777
    const longitud_de_palabra = 16; // formato en octal: xx-xxxx -> operación-dirección

    let UM = {
        MAR: '000000000000',
        MBR: '0000000000000000',
        memoria: new Array(cantidad_de_posiciones),

        set_MAR: (direccion) => {
            UM.MAR = direccion;
        },
        get_MAR: () => {
            return UM.MAR;
        },
        set_MBR: (palabra) => {
            UM.MBR = palabra;
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
        }
    }

    // Inicializo la estructura de la memoria (RAM de 4096x16)

    for (let i = 0; i < UM.memoria.length; i++) {
        UM.memoria[i] = '0000000000000000';
    }



    // UNIDAD DE PROCESAMIENTO CENTRAL (CPU)

    const registro_con_1 = '0000000000000001';

    let CPU = {
        ACC: '0000000000000000',
        IR: '0000000000000000',
        PC: '000000000000',
        R1: registro_con_1,
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

        // HALT

        // ADD
        ADD: () => {
            CPU.Z = CPU.ACC;
            CPU.Y = UM.leer_memoria(CPU.leer_dir_IR());
            CPU.ALU = (parseInt(CPU.Z, 2) + parseInt(CPU.Y, 2)).toString(2);
            CPU.ALU = ponerCeros_16bits(CPU.ALU);
            CPU.ACC = CPU.ALU;
        },

        // XOR
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

        // AND
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

        // IOR
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

        // NOT
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

        // LDA
        LDA: () => {
            CPU.ACC = UM.leer_memoria(CPU.leer_dir_IR());
        },

        // STA
        STA: () => {
            UM.escribir_memoria(CPU.leer_dir_IR(), CPU.ACC);
        },

        // SRJ
        SRJ: () => {
            CPU.ACC = CPU.PC;
            CPU.ACC = ponerCeros_16bits(CPU.ACC);
            CPU.PC = CPU.leer_dir_IR();
        },

        // JMA
        JMA: () => {
            if (CPU.ACC.charAt(0) == '1') {
                CPU.PC = CPU.leer_dir_IR();
            }
        },

        // JMP
        JMP: () => {
            CPU.PC = CPU.leer_dir_IR();
        },

        // INP
        // OUT
        // RAL
        RAL: () => {
            CPU.Z = CPU.ACC;
            let aux = '';
            for (let i = 1; i < 16; i++) {
                aux = aux + CPU.Z.charAt(i);
            };
            CPU.ALU = aux + CPU.Z.charAt(0);
            CPU.ACC = CPU.ALU;
        },
        // CSA
        // NOP
    };





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