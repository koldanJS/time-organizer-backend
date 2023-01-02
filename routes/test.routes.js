const { Router } = require("express");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const User = require("../models/User");
const router = Router();

// Здесь путь по умолчанию начинается с api/auth

//Переходя в такой end point
router.all(
  "*",
  [
    //До callback используем массив валидаторов, которые сформируют объект ошибок (если будут)
    check("email", "Некорректный email").isEmail(),
    check("password", "Минимальная длина пароля 6 символов").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    console.log("body", req.body);
    console.log("body", req);
    try {
      //Получаем сформированный объект ошибок
      const errors = validationResult(req);

      //Если ошибки есть
      if (!errors.isEmpty()) {
        //Формируем ответ с статусом 400
        return res.status(400).json({
          //Преобразуем объект ошибок в массив
          errors: errors.array(),
          message: "Некорректные данные при регистрации",
        });
      }

      //Получаем из тела запроса
      const { email, password } = req.body;

      //Метод ищет одно совпадение в БД, передается объект (ключ и значение совпадают)
      const candidate = await User.findOne({ email });

      //Если что-то нашлось
      if (candidate) {
        //Значит нужно выйти, т.к. пользователь существует
        return res
          .status(400)
          .json({ message: "Такой пользователь уже существует!" });
      }

      //Хешируем пароль, 2й аргумент усложняет шифрование
      const hashedPassword = await bcrypt.hash(password, 12);

      //Передаем объект нового пользователя (с хешированным паролем)
      const user = new User({ email, password: hashedPassword });

      //Дожидаемся сохранения в БД
      await user.save();

      //201 статус - создан, отвечаем им на frontend
      res.status(201).json({ message: "Пользователь создан" });
    } catch (e) {
      //Если мы тут, что-то непредвиденное случилось
      res
        .status(500)
        .json({ message: "Что-то пошло не так, попробуйте снова" });
    }
  }
);

module.exports = router;
