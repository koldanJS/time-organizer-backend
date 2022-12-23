const msPerDay = 1000*3600*24
const msPerMin = 1000*60

const getAdditionTime = (activeItem) => {
    if (!activeItem) return 0
    return Math.round( (Date.now() - activeItem.startTime) / msPerMin )
}

const  getNow = (offset) => offset ? (new Date(Date.now() + offset*msPerDay)) : new Date()

const getDateString = (offset, timePoint = null) => {
    let now = getNow(offset)
    if (timePoint) now = new Date(timePoint)
    return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
}

const getDayNumber = (offset) => {
    const now = getNow(offset)
    return now.getDay() ? (now.getDay() - 1) : 6
}

const getRange = (offset) => {
    const dayNumber = getDayNumber(offset)
    return [
        -dayNumber, // Смещение от текущего дня к понедельнику
        6 - dayNumber // Смещение от текущего дня к воскресенью
    ]
}

const getSelectedWeek = (offset) => {
    const range = getRange(offset)
    const selectedWeek = []
    for (let rangeOffset = range[0]; rangeOffset <= range[1]; rangeOffset++) {
        selectedWeek.push(getDateString(offset + rangeOffset))
    }
    return selectedWeek
}

module.exports = { msPerDay, msPerMin, getAdditionTime, getNow, getDateString, getDayNumber, getRange, getSelectedWeek }