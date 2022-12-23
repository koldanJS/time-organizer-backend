const { Router } = require('express')
const Archive = require('../models/Archive')
const TimesSheet = require('../models/TimesSheet')
const auth = require('../middleware/auth.middleware')
const router = Router()

//Путь по умолчанию api/archive + окончание
router.get('/', auth, async (req, res) => {
    try {
        // Ищем archive, благодаря MW в req есть объект user
        const archive = await Archive.find({ user: req.user.userId })
        // Отправляем найденное или []
        res.json(archive)
    } catch(e) {
        //Если мы тут, что-то непредвиденное случилось
        res.status(500).json({ message: 'При получении архива что-то пошло не так' })
    }
})

router.post('/create/:date', auth, async (req, res) => {
    try {
        // Ищем соответствующий дате архив и удаляем
        const existArchive = await Archive.findOne({ date: req.params.date, user: req.user.userId })
        // Если такой есть - удаляем, чтоб заменить новым
        if (existArchive) {
            await Archive.findOneAndDelete({ date: req.params.date, user: req.user.userId })
        }
        // Ищем соответствующую дате timesSheet
        const timesSheet = await TimesSheet.findOne({ date: req.params.date, user: req.user.userId })
        // Если такой нет, отправляем
        if (!timesSheet) {
            return res.status(404).json({ message: `Таблица за ${req.params.date} не найдена` })
        }
        // Создаем новый архив и сохраняем
        const archive = new Archive({
            date: req.params.date,
            week: timesSheet.week,
            user: req.user.userId
        })
        //Дожидаемся сохранения в БД
        await archive.save()
        // Удаляем таблицу
        await TimesSheet.findOneAndDelete({ date: req.params.date, user: req.user.userId })
        // Ищем все архивы пользователя
        // Ищем archive, благодаря MW в req есть объект user
        const archives = await Archive.find({ user: req.user.userId })
        // Отправляем ответом
        res.json(archives)
    } catch(e) {
        //Если мы тут, что-то непредвиденное случилось
        res.status(500).json({ message: 'При получении таблицы что-то пошло не так' })
    }
})

router.delete('/delete', auth, async (req, res) => {
    try {
        // Получаем id
        const { id } = req.body
        // Ищем и удаляем архив
        await Archive.findByIdAndDelete(id)
        // Ищем archive, благодаря MW в req есть объект user
        const archives = await Archive.find({ user: req.user.userId })
        // Отправляем ответом
        res.json(archives)
    } catch(e) {
        //Если мы тут, что-то непредвиденное случилось
        res.status(500).json({ message: 'При получении таблицы что-то пошло не так' })
    }
})

module.exports = router