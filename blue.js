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
        // AND
        // IOR
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
        }

        // LDA
        // STA
        // SRJ
        // JMA
        // JMP
        // INP
        // OUT
        // RAL
        // CSA
        // NOP
    };





    // PRUEBA

    /*
    //PRUEBA DEL ADD

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


    //PRUEBA DEL NOT
    
    CPU.ACC = '0000000011001001';

    console.log(CPU.ACC);

    CPU.NOT();
    
    console.log(CPU.ACC);

    */

})