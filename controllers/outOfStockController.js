import OutOfStock from "../modules/outOfStockModules.js";
import { responses } from "../utlies/response.js";

export const getAllOutOfStock = async (req, res) => {

    try {
        const currentPage = Number(req.query.currentPage) || 1;
        const limit = Number(req.query.limit) || 5;
        const search = req.query.search || "";

        console.log(req.query.search);
        const skip = (currentPage - 1) * limit;

        const filter = {};

        if (search) {
            filter.productId = {
                $regex: search,
                $options: "i",
            };
        }

        const total = await OutOfStock.countDocuments(filter);

        const outOfStockData = await OutOfStock.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        return responses(res, 200, "Out Of Stock fetched", {
            result: outOfStockData,
            total,
            currentPage,
            totalPages: Math.ceil(total / limit),
            limit,
        });

    } catch (error) {
        console.log(error);
        return responses(res, 500, "Internal Server Error");
    }
};