import Product from "../modules/productModules.js";
import { responses } from "../utlies/response.js";

export const getStockOverview = async (req, res) => {
    try {

        const result = await Product.aggregate([
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    stock: { $sum: "$quantity" }
                }
            },
            {
                $sort: {
                    "_id": 1
                }
            }
        ]);

        const months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        const data = months.map((month, index) => {
            const find = result.find(item => item._id === index + 1);

            return {
                month,
                stock: find ? find.stock : 0
            };
        });
        
        return responses(res, 200, "Stock overview fetched successfully", data);

    } catch (error) {
        console.log(error);
        return responses(res, 500, "Internal Server Error");
    }
};