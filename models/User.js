const { Schema, model, Types } = require('mongoose')

const schema = new Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    firstName: {type: String, default: 'User'},
    lastName: {type: String, default: 'LastName'},
    company: {type: String, default: ''},
    phone: {type: String, default: ''},
    dateOfBirth: {type: String, default: ''},
    activeEntry: {type: Types.ObjectId, ref: 'ActiveEntry'},  //ref - к какой коллекции привязываемся
    archives: {type: [Types.ObjectId], ref: 'Archive'},
    projectsId: {type: [Types.ObjectId], ref: 'Project'},
    tasksId: {type: [Types.ObjectId], ref: 'Task'},
    timesSheets: {type: [Types.ObjectId], ref: 'TimesSheet'},
})

module.exports = model('User', schema)