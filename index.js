require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const router = require('./router/index')
const errorMiddleware = require('./middleware/error-middleware')
const fileUpload = require('express-fileupload')
const { createServer } = require('http')
const { Server } = require('socket.io')

// порт нашего сервера
const PORT = process.env.PORT || 5001

// инициализируем express
const app = express()

// учим базу работать с json
app.use(express.json())
// работа с куками
app.use(cookieParser())
// cors
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}))
// работа с файлами
app.use(fileUpload())
// роуты
app.use('/', router)
// обработка ошибок
app.use(errorMiddleware)

const httpServer = createServer(app)
const io = new Server(httpServer, {
    cors: {
        origins: [process.env.CLIENT_URL]
    }
})

io.on('connection', (socket) => {
    console.log('Подключились к сокету')
    socket.on('disconnect', () => {
        console.log('Отключились от сокета')
    })

    socket.on('chat message', (msg) => {
        console.log(msg)
    });
})

// функция запуска сервера
const start = async () => {
    try {
        // подключаемся к базе
        await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        // стартуем сервер
        httpServer.listen(PORT, () => console.log(`Сервер запущен по адресу http://localhost:${PORT}`))
    } catch (e) {
        console.log(e)
    }
}

start()