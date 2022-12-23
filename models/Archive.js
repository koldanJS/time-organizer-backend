const { Schema, model, Types } = require('mongoose')

const schema = new Schema({
    date: {type: String, required: true},
    week: {type: Object, required: true},
    user: {type: Types.ObjectId, ref: 'User'},  //ref - к какой коллекции привязываемся
})

module.exports = model('Archive', schema)