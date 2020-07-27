// Requires
var express = require('express');

// Modelos
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');
const hospital = require('../models/hospital');
const usuario = require('../models/usuario');

// Inicializar
var app = express();

//  -----------------------------------
//  Busqueda por coleccion
//  -----------------------------------
app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var expresionReg = RegExp(busqueda, 'i');

    var promesa;

    if(tabla === 'medicos'){

        promesa = buscarMedicos(busqueda, expresionReg)

    }else if(tabla === 'hospitales'){

        promesa = buscarHospitales(busqueda, expresionReg)

    }else if(tabla === 'usuarios'){

        promesa = buscarUsuarios(busqueda, expresionReg)

    }else{
        
        return res.status(400).json({
            ok: false,
            message: 'no existe la tabla ' + tabla
        });
    }

    promesa.then(respuestas => {

        res.status(200).json({
            ok: true,
            [tabla]: respuestas
        });

    });

});



//  -----------------------------------
//  Busqueda general
//  -----------------------------------

app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var expresionReg = RegExp(busqueda, 'i');

    Promise.all([buscarHospitales(busqueda, expresionReg),
    buscarMedicos(busqueda, expresionReg),
    buscarUsuarios(busqueda, expresionReg)])
        .then(respuestas => {

            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });
});

function buscarHospitales(busqueda, expresionReg) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: expresionReg })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {

                if (err) {
                    reject('Error al cargar hospitales ', err);
                } else {
                    resolve(hospitales)
                }
            });
    });
}

function buscarMedicos(busqueda, expresionReg) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: expresionReg })
            .populate('usuario', 'nombre email')
            .populate('hospital', 'nombre')
            .exec((err, medicos) => {

                if (err) {
                    reject('Error al cargar medicos ', err);
                } else {
                    resolve(medicos)
                }
            });
    });
}

function buscarUsuarios(busqueda, expresionReg) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': expresionReg }, { 'email': expresionReg }])
            .exec((err, usuarios) => {

                if (err) {
                    reject('Error al cargar usuarios ', err);
                } else {
                    resolve(usuarios)
                }
            });
    });
}

module.exports = app;