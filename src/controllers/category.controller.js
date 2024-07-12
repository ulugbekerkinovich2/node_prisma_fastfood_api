const prisma = require("../../utils/prisma_connection");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const Joi = require("joi");

const Categorieschema = Joi.object({
    name: Joi.string().required(),
    photo: Joi.required()
});

const createCategory = async (req, res) => {
    try {
        const user = req.user;
        const { isAdmin } = user;
        if (!isAdmin) {
            return res.status(403).json({
                message: "Forbidden"
            })
        }
        const { name } = req.body;
        const { photo } = req.files;
        const findName = await prisma.category.findFirst({
            where: {
                name
            }
        })

        if (findName) {
            return res.status(400).json({
                message: "Category already exists"
            })
        }
        const { error } = Categorieschema.validate({ name, photo });
        if (error) {
            return res.status(400).json({
                message: error.details[0].message
            });
        }

        const photoName = `${uuidv4()}.${photo.mimetype.split("/")[1]}`;
        const photoPath = path.join(process.cwd(), 'uploads', photoName);

        const category = await prisma.category.create({
            data: {
                name,
                photo: photoName // Store only the file name in the database
            }
        });

        photo.mv(photoPath, (err) => {
            if (err) {
                return res.status(500).json({
                    message: "Failed to upload photo",
                    error: err.message
                });
            }
        });

        return res.status(201).json({
            message: "Category created successfully",
            category
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};


const getCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany();
        return res.status(200).json({
            categories
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}

const updateCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const { id } = req.params;
        const { photo } = req.files;

        const findCategoryByid = await prisma.category.findFirst({
            where: {
                id
            }
        });
        if (!findCategoryByid) {
            return res.status(404).json({
                message: "Category not found"
            });
        }
        const updateCategory = await prisma.category.update({
            where: {
                id
            },
            data: {
                name: name ? name : findCategoryByid.name,
                photo: photo ? `${uuidv4()}.${photo.mimetype.split("/")[1]}` : findCategoryByid.photo
            }
        });
        return res.status(200).json({
            message: "Category updated successfully",
            updateCategory
        });
    } catch (error) {

    }
}

const deleteCategory = async (req, res) => {
    try {
        const user = req.user;
        const { isAdmin } = user;
        if (!isAdmin) {
            return res.status(403).json({
                message: "Forbidden"
            })
        }
        const { id } = req.params;
        const findCategoryByid = await prisma.category.findFirst({
            where: {
                id
            }
        });
        if (!findCategoryByid) {
            return res.status(404).json({
                message: "Category not found"
            });
        }
        const deleteCategory = await prisma.category.delete({
            where: {
                id
            }
        });
        return res.status(200).json({
            message: "Category deleted successfully",
            deleteCategory
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}
module.exports = { createCategory, getCategories, updateCategory, deleteCategory };
