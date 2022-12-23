const {Router} = require('express')
const {check, validationResult} = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const User = require('../models/User')
const router = Router()

// Здесь путь по умолчанию начинается с api/auth

//Переходя в такой end point
router.post(
    '/register',
    [   //До callback используем массив валидаторов, которые сформируют объект ошибок (если будут)
        check('email', 'Некорректный email').isEmail(),
        check('password', 'Минимальная длина пароля 6 символов')
            .isLength({ min: 6 })
    ],
    async (req, res) => {
        console.log('body', req.body)
        try {
            //Получаем сформированный объект ошибок
            const errors = validationResult(req)

            //Если ошибки есть
            if (!errors.isEmpty()) {
                //Формируем ответ с статусом 400
                return res.status(400).json({
                    //Преобразуем объект ошибок в массив
                    errors: errors.array(),
                    message: 'Некорректные данные при регистрации'
                })
            }

            //Получаем из тела запроса
            const { email, password } = req.body

            //Метод ищет одно совпадение в БД, передается объект (ключ и значение совпадают)
            const candidate = await User.findOne({email})

            //Если что-то нашлось
            if (candidate) {
                //Значит нужно выйти, т.к. пользователь существует
                return res.status(400).json({ message: 'Такой пользователь уже существует!' })
            }

            //Хешируем пароль, 2й аргумент усложняет шифрование
            const hashedPassword = await bcrypt.hash(password, 12)

            //Передаем объект нового пользователя (с хешированным паролем)
            const user = new User({email, password: hashedPassword})

            //Дожидаемся сохранения в БД
            await user.save()

            //201 статус - создан, отвечаем им на frontend
            res.status(201).json({ message: 'Пользователь создан' })

        } catch(e) {
            //Если мы тут, что-то непредвиденное случилось
            res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
        }
    }
)

router.post(
    '/login',
    [   //До callback используем массив валидаторов, которые сформируют объект ошибок (если будут)
        check('email', 'Введите корректный email').normalizeEmail().isEmail(),
        check('password', 'Введите пароль').exists()
    ],
    async (req, res) => {
        try {
            //Получаем сформированный объект ошибок
            const errors = validationResult(req)

            //Если ошибки есть
            if (!errors.isEmpty()) {
                //Формируем ответ с статусом 400
                return res.status(400).json({
                    //Преобразуем объект ошибок в массив
                    errors: errors.array(),
                    message: 'Некорректные данные при входе в систему'
                })
            }

            //Получаем из тела запроса
            const { email, password } = req.body

            //Метод ищет одно совпадение в БД, передается объект
            const user = await User.findOne({ email })

            //Если не нашлось
            if (!user) {
                //Значит нужно выйти, т.к. пользователь не существует
                return res.status(400).json({ message: 'Пользователь не найден!' })
            }

            //Дожидаемся, что bcrypt сравнит введенный пароль с сохраненным хешированным
            const isMatch = await bcrypt.compare(password, user.password)

            if (!isMatch) {
                return res.status(400).json({ message: 'Неверный пароль, попробуйте снова!' })
            }

            //Создаем jwt токен
            const token = jwt.sign(
                //Объект с данными, которые будут зашифрованы в токен
                { userId: user.id },
                //Секретный ключ (любая строка)
                config.get('jwtSecret'),
                //Срок существования токена
                { expiresIn: '24h' } // Или время в секундах или строка 'цифра + приставка h' в часах: '1h'
            )

            //Вернуть ответ со статусом 200 по умолчанию
            res.json({ token, userId: user.id, message: 'Успех' })

        } catch(e) {
            //Если мы тут, что-то непредвиденное случилось
            res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
        }
    }
)

module.exports = router