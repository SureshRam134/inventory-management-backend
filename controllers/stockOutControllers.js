import StockOut from "../modules/stockoutModules.js";
import { responses } from "../utlies/response.js";





export const getAllStockOut = async (req, res) => {

    try {
        const currentPage = Number(req.query.currentPage) || 1;
        const limit = Number(req.query.limit) || 5;
        const search = req.query.search || "";

        console.log(req.query.search);
        const skip = (currentPage - 1) * limit;

        const filter = {};

        if (search) {
            filter.orderId = {
                $regex: search,
                $options: "i",
            };
        }

        const total = await StockOut.countDocuments(filter);

        const supplierData = await StockOut.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: 1 });

        return responses(res, 200, "StockIn fetched", {
            result: supplierData,
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