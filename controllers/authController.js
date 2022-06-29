const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const conexion = require('../database/bd');
const { promisify } = require('util');
const exp = require('constants');

//metodo para registrarnos
exports.register = async (req, res) => {
    try {
        const user = req.body.user
        const cedula = req.body.cedula
        const pass = req.body.pass
        const rol = req.body.rol
        //console.log(user+" -- "+cedula+" -- "+pass+" -- "+rol)
        let passhash = await bcrypt.hash(pass, 8)
        console.log(passhash)
        //console.log(passhash)
        conexion.query('INSERT INTO usuario SET ?', { nombre_usuario: user, cedula: cedula, password: passhash, rol: rol }, (error, results) => {
            if (error) { { console.log(error) } }
            res.redirect('/')
        })
    } catch (error) {
        console.log(error)
    }

}

exports.login = async (req, res) => {
    try {
        const user = req.body.user
        const pass = req.body.pass
        // console.log(user + "--" + pass)
        if (!user || !pass) {
            res.render('login', {
                alert: true,
                alertTittle: 'Advertencia',
                alertMessage: 'Ingrese un usuario y password',
                alertIcon: 'info',
                showConfirmButton: false,
                timer: 3000,
                ruta: 'login'
            })
        } else {
            conexion.query('SELECT * FROM usuario WHERE nombre_usuario = ?', [user], async (error, results) => {
                
                // console.log("entraa " + results[0].password)

                if (results.length == 0 || !(await bcrypt.compare(pass, results[0].password))) {
                    //  console.log("pass "+pass+" no entro " + results[0].password)
                    res.render('login', {
                        alert: true,
                        alertTittle: 'Error',
                        alertMessage: 'Usuario y/o Password incorrectos',
                        alertIcon: 'error',
                        showConfirmButton: false,
                        timer: 3000,
                        ruta: 'login'
                    })
                } else {//inicio de sesion ok
                    const id = results[0].id_usuario
                    // console.log("entro aqui")
                    // console.log(id)
                    //token sin fecha de expiracion
                    //const token = jwt.sign({ id: id }, process.env.JWT_SECRETO)
                    //token que expira
                    //process.env.JWT_SECRETO
                     const token = jwt.sign({ id: id }, process.env.JWT_SECRETO, {expiresIn: process.env.JWT_TIEMPO_EXPIRA})

                    console.log("TOKEN: " + token + " para el usuario " + user)

                    const cookiesOptions = {
                        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 1000),
                        httpOnly: true
                    }
                    res.cookie('jwt', token, cookiesOptions)
                    res.render('login', {
                        alert: true,
                        alertTittle: 'Conexion Exisota',
                        alertMessage: '!BIENVENIDO¡',
                        alertIcon: 'success',
                        showConfirmButton: false,
                        timer: 3000,
                        ruta: ''
                    })
                }
            })
        }
    } catch (error) {
        console.log(error)
    }
}


exports.isAuthenticated = async (req, res, next)=>{
    if(req.cookies.jwt){
        try {
            const decodificada = await promisify(jwt.verify)(req.cookies.jwt,process.env.JWT_SECRETO)
            // console.log("decodificada "+decodificada.id)
            conexion.query('SELECT * FROM usuario WHERE id_usuario = ?',[decodificada.id],(error,results)=>{
                if(!results){
                    // console.log("resultados "+results)
                    return next()
                }
                req.user = results[0]
                return next()
            })
        } catch (error) {
            console.log(error)
            return next()
        }
    }else{
        res.redirect('/login')
        
    }

}

exports.logout = async (req, res)=>{
    res.clearCookie('jwt')
    return res.redirect('/')
}