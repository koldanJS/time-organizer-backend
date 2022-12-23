const { Schema, model, Types } = require('mongoose')

const schema = new Schema({
    date: {type: String, required: true},
    days: {type: [Object], default: []},
    week: {type: Object, default: {}},
    user: {type: Types.ObjectId, ref: 'User'},  //ref - к какой коллекции привязываемся
})

module.exports = model('TimesSheet', schema)