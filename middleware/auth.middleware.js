const config = require('config')
const jwt = require('jsonwebtoken')

//Этот MW проверяет действительность токена и получает из него userId
module.exports = (req, res, next) => {
    //Если просто проверяется доступность сервера, ничего не делать
    if (req.method === 'OPTIONS') return next()

    try {
        const token = req.headers.authorization.split(' ')[1] // 'Bearer TOKEN'

        if (!token) {
            //Статус 401 - нет авторизации
            return res.status(401).json({ message: 'Нет авторизации' })
        }

        //Раскодировали токен, получили объект с userId
        const decoded = jwt.verify(token, config.get('jwtSecret'))
        //Положили его в ответ
        req.user = decoded

        //Передали данные дальше
        next()

    } catch(e) {
        //Если что-то пошло не так, значит авторизации нет
        res.status(401).json({ message: 'Нет авторизации' })
    }

}