const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

const app = express()

const port = process.env.PORT || 3000;

//seteamos motor de plantillas
app.set('view engine','ejs')

//seteamos la carpeta public para archivos estaticos
app.use(express.static('public'))

//para procesar datos enviados desde forms
app.use(express.urlencoded({extended:true}))
app.use(express.json())

//seteamos las variables de entorno
dotenv.config({path:'./env/.env'})

//para trabajar con las cookies
app.use(cookieParser())

//llamar al router  
app.use('/', require('./routes/router'))

// app.get('/',(req,res)=>{
//     res.render('index');
// })

//para eliminar la cache y que no se pueda volver con el boton de back luego de hacer LOGOUT
app.use(function(req, res, next){
    if (!req.user)
    res.header('Cache-Control','private, no-cache, no-store, must-revalidate');
    next();
});

app.listen(port,()=>{
    console.log('SERVER UP en el puerto ', port)
})