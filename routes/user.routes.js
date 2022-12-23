const { Router } = require('express')
const User = require('../models/User')
const auth = require('../middleware/auth.middleware')
const router = Router()

//Путь по умолчанию api/user + окончание
router.put('/', auth, async (req, res) => {
    try {
        //Благодаря MW в req есть объект user
        const user = await User.findById(req.user.userId)

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' })
        }

        const userData = req.body
        await User.updateOne({_id: req.user.userId}, userData)

        res.json({ message: 'Пользователь изменен!' })
    } catch(e) {
        //Если мы тут, что-то непредвиденное случилось
        res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
    }
})

router.get('/', auth, async (req, res) => {
    try {
        //Благодаря MW в req есть объект user
        const user = await User.findById(req.user.userId)

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' })
        }

        res.json(user)
    } catch(e) {
        //Если мы тут, что-то непредвиденное случилось
        res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
    }
})

router.get('/info', auth, async (req, res) => {
    try {
        //Благодаря MW в req есть объект user
        const user = await User.findById(req.user.userId)

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' })
        }

        const info = {
            company: user.company,
            dateOfBirth: user.dateOfBirth,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            projectsId: user.projectsId,
            tasksId: user.tasksId
        }

        res.json(info)
    } catch(e) {
        //Если мы тут, что-то непредвиденное случилось
        res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
    }
})

module.exports = router