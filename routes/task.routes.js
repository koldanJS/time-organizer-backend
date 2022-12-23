const { Router } = require('express')
const Task = require('../models/Task')
const auth = require('../middleware/auth.middleware')
const router = Router()

//Путь по умолчанию api/task + окончание
// router.post('/create', auth, async (req, res) => {
//     try {
//         const { projectName, description } = req.body
//         //Проверяем, существует ли такой проект у пользователя
//         const existing = await Project.findOne({ name: projectName, user: req.user.userId })
//         //Если да, просто отправляем его ответом
//         if (existing) {
//             return res.status(400).json({ message: 'Такой проект уже существует!', project: existing })
//         }

//         //Создаем и сохраняем проект, userId доступен благодаря MW auth
//         const project = new Project({
//             name: projectName, description, user: req.user.userId
//         })
//         await project.save()

//         //После сохранения со статусом 'created' отправляем ответ
//         res.status(201).json({ message: 'Проект создан!', project })
//     } catch(e) {
//         //Если мы тут, что-то непредвиденное случилось
//         res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
//     }
// })

// router.delete('/delete', auth, async (req, res) => {
//     try {
//         const { projectId } = req.body
//         //Проверяем, существует ли такой проект у пользователя
//         const existing = await Project.findById(projectId)
//         //Если да, просто отправляем его ответом
//         if (!existing) {
//             return res.status(404).json({ message: 'Проект не найден!'})
//         }

//         //Удаляем проект
//         await Project.findByIdAndDelete(projectId)

//         //После удаления отправляем ответ
//         res.json({ message: 'Проект удален!' })
//     } catch(e) {
//         //Если мы тут, что-то непредвиденное случилось
//         res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
//     }
// })

router.get('/', auth, async (req, res) => {
    try {
        //Благодаря MW в req есть объект user
        const tasks = await Task.find({ user: req.user.userId })
        res.json(tasks)
    } catch(e) {
        //Если мы тут, что-то непредвиденное случилось
        res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
    }
})

// router.get('/:id', auth, async (req, res) => {
//     try {
//         const project = await Project.findById(req.params.id)
//         res.json(project)
//     } catch(e) {
//         //Если мы тут, что-то непредвиденное случилось
//         res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
//     }
// })

module.exports = router