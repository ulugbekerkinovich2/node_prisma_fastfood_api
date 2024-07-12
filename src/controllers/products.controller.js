const path = require("path");
const { v4: uuid } = require("uuid");
const Joi = require("joi");
const prisma = require("../../utils/prisma_connection");

const Productschema = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().required(),
    categoryId: Joi.string().required(),
    photo: Joi.any().required(),
});

const createProduct = async (req, res) => {
    try {
        const user = req.user;
        const { isAdmin } = user;
        if (!isAdmin) {
            return res.status(403).json({
                message: "Forbidden",
            });
        }

        const { name, price, categoryId } = req.body;
        const { photo } = req.files;

        const { error } = Productschema.validate({ name, price, categoryId, photo });
        if (error) {
            return res.status(400).json({
                message: error.details[0].message,
            });
        }
        const findProduct = await prisma.product.findFirst({
            where: {
                name,
            },
        });
        if (findProduct) {
            return res.status(400).json({
                message: "Product already exists",
            });
        }


        const photoName = `${uuid()}.${photo.mimetype.split("/")[1]}`;
        const uploadPath = path.join(process.cwd(), "uploads", photoName);

        photo.mv(uploadPath, async (err) => {
            if (err) {
                return res.status(500).json({
                    message: "Failed to upload photo",
                    error: err.message
                });
            }

            try {
                const newProduct = await prisma.product.create({
                    data: {
                        name,
                        price,
                        categoryId,
                        photo: photoName,
                    },
                });

                return res.status(201).json({
                    message: "Product created successfully",
                    product: newProduct,
                });
            } catch (error) {
                console.error('Prisma Error:', error);
                return res.status(500).json({
                    message: error.message,
                });
            }
        });
    } catch (error) {
        console.error('General Error:', error); // Debugging line
        return res.status(500).json({
            message: error.message,
        });
    }
};

const getProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany();
        return res.status(200).json({
            message: "Products retrieved successfully",
            products,
        });
    } catch (error) {
        console.error('Prisma Error:', error);
        return res.status(500).json({
            message: error.message,
        });
    }
}

const updateProduct = async (req, res) => {
    try {
        const data = req.user;
        const { isAdmin } = data;
        if (!isAdmin) {
            return res.status(403).json({
                message: "Forbidden",
            });
        }

        const { id } = req.params;
        const { name, price, categoryId } = req.body;
        const { photo } = req.files;

        const { error } = Productschema.validate({ name, price, categoryId, photo });
        if (error) {
            return res.status(400).json({
                message: error.details[0].message,
            });
        }

        const photoName = `${uuid()}.${photo.mimetype.split("/")[1]}`;
        const uploadPath = path.join(process.cwd(), "uploads", photoName);

        // Move photo to the upload path
        photo.mv(uploadPath, async (err) => {
            if (err) {
                return res.status(500).json({
                    message: "Failed to upload photo",
                    error: err.message
                });
            }

            try {
                const updatedProduct = await prisma.product.update({
                    where: { id },
                    data: {
                        name,
                        price,
                        categoryId,
                        photo: photoName,
                    }
                });

                return res.status(200).json({
                    message: "Product updated successfully",
                    product: updatedProduct
                });

            } catch (updateError) {
                console.error('Update Error:', updateError);
                return res.status(500).json({
                    message: updateError.message,
                });
            }
        });

    } catch (error) {
        console.error('General Error:', error);
        return res.status(500).json({
            message: error.message,
        });
    }
}

const deleteProduct = async (req, res) => {
    try {
        const user = req.user;
        const { isAdmin } = user;
        if (!isAdmin) {
            return res.status(403).json({
                message: "Forbidden",
            });
        }
        const { id } = req.params;
        const findProduct = await prisma.product.findFirst({
            where: {
                id
            }
        })
        if (!findProduct) {
            return res.status(404).json({
                message: "Product not found",
            });
        }
        const deleteProduct = await prisma.product.delete({
            where: {
                id
            }
        });
        return res.status(200).json({
            message: "Product deleted successfully",
            deleteProduct
        });
    } catch (error) {
        console.error('Prisma Error:', error);
        return res.status(500).json({
            message: error.message,
        });
    }
}
module.exports = { createProduct, getProducts, updateProduct, deleteProduct };
