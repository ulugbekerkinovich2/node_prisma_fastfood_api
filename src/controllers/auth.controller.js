const prisma = require("../../utils/prisma_connection");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");


const Userschema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
});


const register = async (req, res) => {
    try {
        const { username, password } = req.body;

        const { error } = Userschema.validate({ username, password });
        if (error) {
            return res.status(400).json({
                message: error.details[0].message
            });
        }

        const findUser = await prisma.users.findFirst({
            where: { username }
        });
        if (findUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }


        const hashPass = await bcrypt.hash(password, 10);


        const user = await prisma.users.create({
            data: {
                username,
                password: hashPass
            }
        });

        return res.status(200).json({
            message: "User created successfully",
            user
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }
};


const login = async (req, res) => {
    try {
        const { username, password } = req.body;


        const { error } = Userschema.validate({ username, password });
        if (error) {
            return res.status(400).json({
                message: error.details[0].message
            });
        }


        const findUser = await prisma.users.findFirst({
            where: { username }
        });
        if (!findUser) {
            return res.status(400).json({
                message: "User does not exist"
            });
        }


        const validPass = await bcrypt.compare(password, findUser.password);
        console.log(validPass);
        if (!validPass) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }
        token = jsonwebtoken.sign({ id: findUser.id, isAdmin: findUser.isAdmin }, process.env.TOKEN_SECRET, { expiresIn: "10h" });
        return res.status(200).json({
            message: "Login successful",
            token: token
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }
};

module.exports = { register, login };
