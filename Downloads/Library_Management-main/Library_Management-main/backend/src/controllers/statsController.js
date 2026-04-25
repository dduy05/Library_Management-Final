import StatsModel from '../models/StatsModel.js';

export const getSummary = async (req, res, next) => {
    try {
        const summary = await StatsModel.getGlobalSummary();
        res.json({ success: true, data: summary });
    } catch (error) {
        next(error);
    }
};

export const getUserSummary = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const summary = await StatsModel.getUserSummary(userId);
        res.json({ success: true, data: summary });
    } catch (error) {
        next(error);
    }
};
