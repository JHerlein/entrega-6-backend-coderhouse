const express = require('express');
const fs = require('fs')
const app = express();
const router = require('./routes/products')
const {getAllProducts,
    getProduct,
    createProduct,
    editProduct,
    deleteProduct
} = require('./controllers/products')

const {Server: IOServer} = require('socket.io')
const {Server: HttpServer} = require('http')
const httpServer = new HttpServer(app)
const io = new IOServer(httpServer)

const port = 8080

app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use('/api/products',router)
app.use(express.static('./public'))
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'ejs')




httpServer.listen(port,console.log(`Listening on port ${port}`))


// GET '/api/productos' -> devuelve todos los productos.
// GET '/api/productos/:id' -> devuelve un producto según su id.
// POST '/api/productos' -> recibe y agrega un producto, y lo devuelve con su id asignado.
// PUT '/api/productos/:id' -> recibe y actualiza un producto según su id.
// DELETE '/api/productos/:id' -> elimina un producto según su id.


// const messages = [
//     { author: "Juan",text:"Hola, que tal?",time:new Date()},
//     { author: "Pedro",text:"Holiiii",time:new Date()},
//     { author: "Ana",text:"uwu", time:new Date()}
// ]

const getAllMensajes = async () => {
    try {
        let file = await fs.promises.readFile('./files/mensajes.txt')
        file = new Array(file)
        return JSON.parse(file)    
    } catch (error) {
        console.log(error)
    }    
}

const createMensaje = async (mensaje) => {      
    try {
        let file = await fs.promises.readFile('./files/mensajes.txt','utf-8')
        file = JSON.parse(file)        
        file.push(mensaje)
        await fs.promises.writeFile('./files/mensajes.txt',JSON.stringify(file,null,2))
        return file              
    } catch (error) {
        console.log(error)
    }  
}

let messages = getAllMensajes()


app.get('/products',(req,res) => {    
    res.render('products.html')
})


io.on('connection', async (socket) => {
    console.log('Usuario conectado')
    socket.emit('render','')    
    socket.emit('messages',await messages.then(data => {return data}))       
    socket.on("productAdded", (data) => {
        console.log("Recibi producto agregado")        
        io.sockets.emit('newProduct','Nuevo producto agregado')
    });
    socket.on('new-message', async data => {        
        messages = createMensaje(data)
        io.sockets.emit('messages',await messages.then(data => {return data}))
    });
})


