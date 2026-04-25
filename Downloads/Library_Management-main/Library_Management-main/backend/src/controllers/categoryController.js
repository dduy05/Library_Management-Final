import CategoryModel from '../models/CategoryModel.js';

export const getAllCategories = async (req, res, next) => {
    try {
        const categories = await CategoryModel.findAll();
        res.json({ success: true, data: categories });
    } catch (error) {
        next(error);
    }
};

export const createCategory = async (req, res, next) => {
    try {
        const { name } = req.body;
        const category = await CategoryModel.create(name);
        res.status(201).json({ success: true, data: category });
    } catch (error) {
        next(error);
    }
};
