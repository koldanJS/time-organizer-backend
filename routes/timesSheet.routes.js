const { Router } = require('express')
const TimesSheet = require('../models/TimesSheet')
const auth = require('../middleware/auth.middleware')
const router = Router()

//Путь по умолчанию api/timesSheet + окончание
router.post('/create/:date', auth, async (req, res) => {
    try {
        // Ищем timesSheet, благодаря MW в req есть объект user
        const timesSheet = await TimesSheet.findOne({ date: req.params.date, user: req.user.userId })
        // Если такой нет, создаем новую и отправляем
        if (!timesSheet) {
            // Передаем объект новой таблицы
            const newTimesSheet = new TimesSheet({
                date: req.params.date,
                days: [
                    {shortDay: 'Пн', items: []},
                    {shortDay: 'Вт', items: []},
                    {shortDay: 'Ср', items: []},
                    {shortDay: 'Чт', items: []},
                    {shortDay: 'Пт', items: []},
                    {shortDay: 'Сб', items: []},
                    {shortDay: 'Вс', items: []},
                ],
                week: {},
                user: req.user.userId
            })
            //Дожидаемся сохранения в БД
            await newTimesSheet.save()
            return res.json(newTimesSheet)
        }
        res.json(timesSheet)
    } catch(e) {
        //Если мы тут, что-то непредвиденное случилось
        res.status(500).json({ message: 'При получении таблицы что-то пошло не так' })
    }
})

router.put('/edit', auth, async (req, res) => {
    try {
        // Получаем новую запись
        const { timesSheetId, dayNumber, newTaskItem, index, isDelete } = req.body
        // Находим таблицу, которую нужно изменить
        const timesSheet = await TimesSheet.findById(timesSheetId)
        if (!timesSheet) {  // Если нет, отправляем
            return res.status(404).json({ message: 'Такая таблица не найдена!' })
        }
        // Получили массив дней для редактирования
        let editDays = [...timesSheet.days]
        // Получили массив записей редактируемого дня
        let editDayItems = editDays[dayNumber].items
        // Добавили новую, отредактированную или удалили запись
        if (isDelete) {
            editDayItems = editDayItems.filter((item, i) => i !== index)
        } else if (index < 0) {
            editDayItems.push(newTaskItem)
        } else {
            editDayItems.forEach((item, i) => {
                if (i === index) editDayItems[i] = newTaskItem
            })
        }
        editDays[dayNumber].items = editDayItems
        // Изменяем отображение недели
        const objItems = {}
        const objTimes = {'Пн': 0, 'Вт': 0, 'Ср': 0, 'Чт': 0, 'Пт': 0, 'Сб': 0, 'Вс': 0, totalTime: 0}
        for (let day of editDays) {  // Преобразуем дни в объект для недельного отображения
            for (let item of day.items) {
                const key = `${item.projectName}____${item.taskName}`
                if (objItems[key]) {
                    const totalTime = objItems[key].totalTime + item.totalTime
                    const dayTime = (objItems[key][day.shortDay] ? objItems[key][day.shortDay]: 0) + item.totalTime
                    objItems[key] = {...objItems[key], [day.shortDay]: dayTime, totalTime }
                } else {
                    objItems[key] = { [day.shortDay]: item.totalTime, totalTime: item.totalTime }
                }
            }
        }
        Object.values(objItems).forEach(item => {
            Object.keys(item).forEach(key => {  // Наполняем objTimes временем для всех дней недели
                objTimes[key] = objTimes[key] + item[key]
            })
        })
        // Изменяем timesSheet в БД
        await TimesSheet.updateOne({ _id: timesSheetId }, { days: editDays, week: { objItems, objTimes } })
        // Находим измененную таблицу
        const editTimesSheet = await TimesSheet.findById(timesSheetId)
        res.status(200).json(editTimesSheet)
    } catch(e) {
        //Если мы тут, что-то непредвиденное случилось
        res.status(500).json({ message: 'При изменении таблицы что-то пошло не так' })
    }
})

router.get('/:date', auth, async (req, res) => {
    try {
        // Ищем timesSheet, благодаря MW в req есть объект user
        const timesSheet = await TimesSheet.findOne({ date: req.params.date, user: req.user.userId })
        // Если нет, отправится null
        res.json(timesSheet)
    } catch(e) {
        //Если мы тут, что-то непредвиденное случилось
        res.status(500).json({ message: 'При получении таблицы что-то пошло не так' })
    }
})

module.exports = router