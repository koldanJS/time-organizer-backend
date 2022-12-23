const { Router } = require('express')
const { getAdditionTime, getSelectedWeek, getDayNumber } = require('../functions')
const ActiveItem = require('../models/ActiveItem')
const TimesSheet = require('../models/TimesSheet')
const auth = require('../middleware/auth.middleware')
const router = Router()

//Путь по умолчанию api/activeItem + окончание
router.post('/create', auth, async (req, res) => {
    try {
        // Получаем индекс активной записи
        const { itemIndex } = req.body
        // Активная запись может относиться только к текущей неделе, поэтому создаем строку
        const dateString = getSelectedWeek(0)[0]    // Берем dateString первого дня текущей недели
        const timesSheet = await TimesSheet.findOne({ date: dateString, user: req.user.userId })
        if (!timesSheet) {
            return res.status(404).json({ message: 'Соответствующая таблица не найдена!' })
        }
        // Создаем и сохраняем запись, userId доступен благодаря MW auth
        const activeItem = new ActiveItem({
            itemIndex, startTime: Date.now(), dayNumber: getDayNumber(0), timesSheet: timesSheet._id, user: req.user.userId
        })
        await activeItem.save()
        //После сохранения со статусом 'created' отправляем ответ
        res.status(201).json(activeItem)
    } catch(e) {
        //Если мы тут, что-то непредвиденное случилось
        res.status(500).json({ message: 'При создании записи что-то пошло не так' })
    }
})

router.delete('/stop', auth, async (req, res) => {
    try {   // Т.к. отсчет времени будет остановлен, нужно сначала добавить к записи добавочное время и после удалить активность
        // Получаем останавливаемую активную запись
        const activeItem = await ActiveItem.findOne({ user: req.user.userId })
        if (!activeItem) {  // Если нет, отправляем
            return res.status(404).json({ message: 'Такая активная запись не найдена!' })
        }
        // Получаем редактируемую неделю
        const timesSheet = await TimesSheet.findById(activeItem.timesSheet)
        if (!timesSheet) {  // Если нет, удаляем активную запись и отправляем
            await ActiveItem.findByIdAndDelete(activeItem._id)
            return res.status(404).json({ message: 'Такая таблица не найдена!' })
        }
        // Получили массив дней для редактирования
        let editDays = [...timesSheet.days]
        // Получили редактируемый день
        let editDay = editDays[activeItem.dayNumber]
        // Получили редактируемую запись
        let editItem = editDay.items[activeItem.itemIndex]
        editItem.totalTime += getAdditionTime(activeItem)   // Добавили время
        // Т.к. все это были привязки к ссылкам, editDays содержит измененное значение

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
        await TimesSheet.updateOne({ _id: timesSheet._id }, { days: editDays, week: { objItems, objTimes } })

        // // Изменяем timesSheet в БД
        // await TimesSheet.updateOne({ _id: timesSheet._id }, { days: editDays })
        // Удаляем активную запись
        await ActiveItem.findByIdAndDelete(activeItem._id)
        // Получаем измененную неделю
        const editTimesSheet = await TimesSheet.findById(activeItem.timesSheet)
        res.json({ message: 'Активная запись удалена!', editTimesSheet })
    } catch(e) {
        //Если мы тут, что-то непредвиденное случилось
        res.status(500).json({ message: 'При удалении активной записи что-то пошло не так' })
    }
})

router.get('/', auth, async (req, res) => {
    try {
        //Благодаря MW в req есть объект user
        const activeItem = await ActiveItem.findOne({ user: req.user.userId })
        res.json(activeItem)
    } catch(e) {
        //Если мы тут, что-то непредвиденное случилось
        res.status(500).json({ message: 'При загрузке записи что-то пошло не так' })
    }
})

module.exports = router