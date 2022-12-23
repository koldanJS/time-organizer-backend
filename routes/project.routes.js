const { Router } = require('express')
const Project = require('../models/Project')
const Task = require('../models/Task')
const auth = require('../middleware/auth.middleware')
const router = Router()

//Путь по умолчанию api/project + окончание
router.post('/create', auth, async (req, res) => {
    try {
        const { projectName, description, newTasks } = req.body
        //Проверяем, существует ли такой проект у пользователя
        const existing = await Project.findOne({ name: projectName, user: req.user.userId })
        //Если существует да, просто отправляем сообщение
        if (existing) {
            return res.status(400).json({ message: 'Проект с таким именем уже существует!' })
        }
        // Если все норм, создаем и сохраняем проект, userId доступен благодаря MW auth
        const project = new Project({
            name: projectName, description, user: req.user.userId
        })
        await project.save()
        // Сохраняем задачи
        await newTasks.forEach(async task => {
            const newTask = new Task({
                name: task.name, project: project._id, user: req.user.userId
            })
            await newTask.save()
        })
        //После сохранения со статусом 'created' отправляем ответ
        res.status(201).json({ message: 'Проект создан!' })
    } catch(e) {
        //Если мы тут, что-то непредвиденное случилось
        res.status(500).json({ message: 'При создании проекта что-то пошло не так' })
    }
})

router.put('/edit', auth, async (req, res) => {
    try {
        const { projectName, description, projectId, newTasks, deletedTasksId } = req.body
        // Проверяем, существует ли вообще такой проект
        const existing = await Project.findById(projectId)
        if (!existing) {
            return res.status(404).json({ message: 'Проект не найден!' })
        }
        // Проверяем, изменилось ли его имя, если да, оно не должно совпадать с именем другого проекта этого пользователя
        if (existing.name !== projectName) {
            // Проверяем, существует ли другой проект с таким именем у пользователя
            const sameProject = await Project.findOne({ name: projectName, user: req.user.userId })
            // Если такой существует, отправляем ...
            if (sameProject) {
                return res.status(400).json({ message: 'Проект с таким именем уже существует!' })
            }
        }
        // Если все норм, изменяем проект, userId доступен благодаря MW auth
        await Project.updateOne({_id: projectId}, {name: projectName, description: description})
        // Затем сначала удаляем старые задачи, чтоб фильтруемый массив был меньше
        await deletedTasksId.forEach(async id => {
            await Task.findByIdAndDelete(id)
        })
        // Теперь сохраняем новые задачи
        await newTasks.forEach(async task => {
            const newTask = new Task({
                name: task.name, project: projectId, user: req.user.userId
            })
            await newTask.save()
        })
        //После отправляем ответ
        res.json({ message: 'Проект изменен!' })
    } catch(e) {
        //Если мы тут, что-то непредвиденное случилось
        res.status(500).json({ message: 'При изменении проекта что-то пошло не так' })
    }
})

router.delete('/delete', auth, async (req, res) => {
    try {
        const { projectId } = req.body
        //Проверяем, существует ли такой проект у пользователя
        const existing = await Project.findById(projectId)
        //Если нет, просто отправляем
        if (!existing) {
            return res.status(404).json({ message: 'Проект не найден!'})
        }
        //Удаляем проект
        await Project.findByIdAndDelete(projectId)
        // И его задачи
        const deletedTasks = await Task.find({ project: projectId, user: req.user.userId })
        deletedTasks.forEach(async task => {
            await Task.findByIdAndDelete(task._id)
        })
        //После удаления отправляем ответ
        res.json({ message: 'Проект удален!' })
    } catch(e) {
        //Если мы тут, что-то непредвиденное случилось
        res.status(500).json({ message: 'При удалении проекта что-то пошло не так' })
    }
})

router.get('/', auth, async (req, res) => {
    try {
        //Благодаря MW в req есть объект user
        const projects = await Project.find({ user: req.user.userId })
        res.json(projects)
    } catch(e) {
        //Если мы тут, что-то непредвиденное случилось
        res.status(500).json({ message: 'При загрузке проекта что-то пошло не так' })
    }
})

module.exports = router