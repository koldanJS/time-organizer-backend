const { Schema, model, Types } = require('mongoose')

const schema = new Schema({
    name: {type: String, required: true},
    project: {type: Types.ObjectId, ref: 'Project'},  //ref - к какой коллекции привязываемся
    user: {type: Types.ObjectId, ref: 'User'},
})

module.exports = model('Task', schema)