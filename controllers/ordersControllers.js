import XLSX from "xlsx";
import fs from "fs";
import { responses } from "../utlies/response.js";
import Order from "../modules/ordersModules.js";
import Product from "../modules/productModules.js";
import StockOut from "../modules/stockoutModules.js";
import notificationModules from "../modules/notificationModules.js";
import { log } from "console";
import OutOfStock from "../modules/outOfStockModules.js";

export const uploadOrders = async (req, res) => {
    try {
        if (!req.file) {
            return responses(res, 400, "Please upload excel file");
        }

        const workbook = XLSX.readFile(req.file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet);

        const lastOrder = await Order.findOne().sort({ orderId: -1 });

        let nextNumber = lastOrder
            ? Number(lastOrder.orderId.split("-")[1])
            : 0;

        const lastOutStock = await OutOfStock.findOne().sort({ outOfStockId: -1 });

        let nextOutNumber = lastOutStock
            ? Number(lastOutStock.outOfStockId.split("-")[1])
            : 0;

        const uploadedOrders = [];

        for (const item of data) {

            const product = await Product.findOne({
                productId: item["Product ID"],
            });

            if (!product) continue;

            const orderQty = Number(item["Quantity"]);
            const productQty = Number(product.quantity);

            if (productQty < orderQty) {

                nextOutNumber++;

                const outOfStockId =
                    `OUT-${String(nextOutNumber).padStart(6, "0")}`;

                const remainingQty = orderQty - productQty;

                await OutOfStock.create({

                    outOfStockId,

                    productId: product.productId,

                    productName: product.productName,

                    supplierId: product.supplierId,

                    orderQuantity: orderQty,

                    customerName: item["Customer Name"],

                    email: item["Email"],

                    phone: item["Phone"],

                    address: item["Address"],

                    image: product.image,

                    status: "Pending",

                });

                await notificationModules.create({

                    title: "Out Of Stock",

                    message: `${product.productName} requires ${remainingQty} more units to Pending to Order.`,

                    type: "OUT_OF_STOCK",

                    role: req.user.role,
                    userId: req.user.id,

                });

                continue;
            }

            const remainingQty = productQty - orderQty;

            let stockStatus = "";

            if (remainingQty === 0) {

                stockStatus = "Out of Stock";

            } else if (remainingQty <= 10) {

                stockStatus = "Low Stock";

            } else {

                stockStatus = "In Stock";

            }

            await Product.findByIdAndUpdate(product._id, {

                quantity: remainingQty,

                status: stockStatus,

            });

            const totalAmount = product.price * orderQty;
            nextNumber++;

            const orderId = `ORD-${String(nextNumber).padStart(6, "0")}`;

            const order = await Order.create({

                orderId,

                productId: product.productId,

                product: product.productName,

                description: product.description,

                price: product.price,

                customerName: item["Customer Name"],

                email: item["Email"],

                phone: item["Phone"],

                quantity: orderQty,

                totalAmount,

                paymentStatus: item["Payment Status"] || "Pending",

                orderStatus: "Pending",

                supplierId: product.supplierId,

                checkStock: "Stock In",

                address: item["Address"],

                image: product.image,

            });

            uploadedOrders.push(order);

            await notificationModules.create({

                title: "New Order",

                message: `Order ${orderId} has been placed.`,

                type: "NEW_ORDER",

                role: req.user.role,
                userId: req.user.id,

            });

            if (remainingQty <= 10 && remainingQty > 0) {

                await notificationModules.create({

                    title: "Low Stock Alert",

                    message: `${product.productName} has only ${remainingQty} units remaining.`,

                    type: "LOW_STOCK",

                    role: req.user.role,
                    userId: req.user.id,

                });

            }

            if (remainingQty === 0) {

                await notificationModules.create({
                    title: "Out Of Stock",
                    message: `${product.productName} is out of stock. The product has been moved to the Out Of Stock list.`,
                    type: "OUT_OF_STOCK",
                    role: req.user.role,
                    userId: req.user.id,
                });

            }

        }

        fs.unlinkSync(req.file.path);

        return responses(res, 201, "Orders uploaded successfully", uploadedOrders);

    } catch (error) {
        console.log(error);

        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return responses(res, 500, "Internal Server Error");
    }
};


export const getAllOrders = async (req, res) => {

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

        const total = await Order.countDocuments(filter);

        const orderData = await Order.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        return responses(res, 200, "Order fetched", {
            result: orderData,
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

export const getOderCount = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        const todayOrders = await Order.countDocuments({
            createdAt: {
                $gte: startOfDay,
                $lt: endOfDay,
            },
        });

        return responses(res, 200, "Order count fetched successfully", {
            totalOrders,
            todayOrders,
        });

    } catch (error) {
        return responses(res, 500, "Internal Server Error");
    }
}

export const getReturnCount = async (req, res) => {
    try {
        const totalReturnOrders = await Order.countDocuments({
            orderStatus: "Return",
        });

        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        const todayReturnOrders = await Order.countDocuments({
            orderStatus: "Return",
            createdAt: {
                $gte: startOfDay,
                $lt: endOfDay,
            },
        });

        return responses(res, 200, "Return order count fetched successfully", {
            totalReturnOrders,
            todayReturnOrders,
        });

    } catch (error) {
        console.log(error);
        return responses(res, 500, "Internal Server Error");
    }
}

export const getCancelledCount = async (req, res) => {
    try {
        const totalCancelledOrders = await Order.countDocuments({
            orderStatus: "Cancelled",
        });

        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        const todayCancelledOrders = await Order.countDocuments({
            orderStatus: "Cancelled",
            createdAt: {
                $gte: startOfDay,
                $lt: endOfDay,
            },
        });

        return responses(res, 200, "Cancelled order count fetched successfully", {
            totalCancelledOrders,
            todayCancelledOrders,
        });

    } catch (error) {
        console.log(error);
        return responses(res, 500, "Internal Server Error");
    }
}

export const softUpdateOrders = async (req, res) => {
    const { orderId, productId, product, price, supplierId, quantity, orderStatus, image, } = req.body; const { id } = req.params;

    try {

        const order = await Order.findById(id);

        if (!order) {
            return responses(res, 404, "Order not found");
        }

        if (order.orderStatus === "Cancelled") {
            return responses(res, 400, "Cancelled order cannot be dispatched.");
        }

        if (order.orderStatus === "Return") {
            return responses(res, 400, "Returned order cannot be dispatched.");
        }

        const lastStockOut = await StockOut.findOne().sort({ createdAt: -1 });
        let count = 1;
        if (lastStockOut) {
            count = Number(lastStockOut.stockOutId.split("-")[1]) + 1;
        }

        const currentStockOutId = `STO-${String(count).padStart(6, "0")}`;

        const currentStatus =
            orderStatus === "Pending" ? "Dispatch" : "Pending";

        const stock = {
            stockOutId: currentStockOutId,
            orderId,
            productId,
            productName: product,
            price,
            supplierId,
            quantity,
            status: currentStatus,
            image,
        };

        const stockOutData = await StockOut.findOne({ orderId });

        if (currentStatus === "Dispatch") {

            if (!stockOutData) {

                await StockOut.create(stock);

                await notificationModules.create({
                    title: "Stock Dispatch",
                    message: `${product} has been dispatched successfully.`,
                    type: "STOCK_OUT",
                    role: req.user.role,
                    userId: req.user.id,
                });

            }

        }

        else {

            if (stockOutData) {

                await StockOut.findByIdAndDelete(stockOutData._id);

            }

        }

        const orderSoftUpdate = await Order.findByIdAndUpdate(
            id,
            {
                orderStatus: currentStatus,
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!orderSoftUpdate) {
            return responses(res, 404, "Order not found");
        }

        return responses(
            res,
            200,
            currentStatus === "Dispatch"
                ? "Order dispatched successfully."
                : "Order moved back to Pending successfully.",
            orderSoftUpdate
        );

    } catch (error) {
        console.log(error);
        return responses(res, 500, "Internal Server Error");
    }
};


export const deleteOrders = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id);

        if (!order) {
            return responses(res, 404, "Order not found");
        }

        if (order.orderStatus !== "Cancelled") {
            return responses(res, 400, "Only cancelled orders can be deleted");
        }

        const orderDelete = await Order.findByIdAndDelete(id);

        return responses(
            res,
            200,
            "Order deleted successfully",
            orderDelete
        );

    } catch (error) {
        console.log(error);
        return responses(res, 500, "Internal Server Error");
    }
};

export const returnOrder = async (req, res) => {
    try {

        const { id } = req.params;

        const order = await Order.findById(id);

        if (!order) {
            return responses(res, 404, "Order not found");
        }

        if (order.orderStatus === "Cancelled") {
            return responses(res, 400, "Cancelled order cannot be returned.");
        }

        const product = await Product.findOne({
            productId: order.productId,
        });

        if (!product) {
            return responses(res, 404, "Product not found.");
        }

        if (order.orderStatus === "Return") {

            const updatedQty =
                Number(product.quantity) - Number(order.quantity);

            if (updatedQty < 0) {
                return responses(res, 400, "Insufficient stock.");
            }

            let stockStatus = "In Stock";

            if (updatedQty === 0) {
                stockStatus = "Out of Stock";
            } else if (updatedQty <= 10) {
                stockStatus = "Low Stock";
            }

            await Product.findByIdAndUpdate(
                product._id,
                {
                    quantity: updatedQty,
                    status: stockStatus,
                },
                { new: true }
            );

            order.orderStatus = "Pending";

            await order.save();

            const stockOut = await StockOut.findOne({
                orderId: order.orderId,
            });

            if (stockOut) {
                await StockOut.findByIdAndDelete(stockOut._id);
            }

            await notificationModules.create({
                title: "Order Pending",
                message: `${order.product} moved back to Pending.`,
                type: "STOCK_OUT",
                role: req.user.role,
                userId: req.user.id,
            });

            return responses(
                res,
                200,
                "Order moved back to Pending.",
                order
            );
        }

        const updatedQty =
            Number(product.quantity) + Number(order.quantity);

        let stockStatus = "In Stock";

        if (updatedQty === 0) {
            stockStatus = "Out of Stock";
        } else if (updatedQty <= 10) {
            stockStatus = "Low Stock";
        }

        await Product.findByIdAndUpdate(
            product._id,
            {
                quantity: updatedQty,
                status: stockStatus,
            },
            { new: true }
        );

        order.orderStatus = "Return";

        await order.save();

        const stockOut = await StockOut.findOne({
            orderId: order.orderId,
        });

        if (stockOut) {

            stockOut.status = "Return";

            await stockOut.save();

        }

        await notificationModules.create({
            title: "Order Returned",
            message: `${order.product} has been returned successfully.`,
            type: "ORDER_RETURNED",
            role: req.user.role,
            userId: req.user.id,
        });

        return responses(
            res,
            200,
            "Order returned successfully.",
            order
        );

    } catch (error) {

        console.log(error);

        return responses(res, 500, "Internal Server Error");
    }
};


export const cancelOrder = async (req, res) => {
    try {

        const { id } = req.params;

        const order = await Order.findById(id);

        if (!order) {
            return responses(res, 404, "Order not found");
        }

        // Already Cancelled
        if (order.orderStatus === "Cancelled") {
            return responses(res, 400, "Order already cancelled.");
        }

        // Already Returned
        if (order.orderStatus === "Return") {
            return responses(res, 400, "Returned order cannot be cancelled.");
        }

        // ==========================
        // PRODUCT
        // ==========================

        const product = await Product.findOne({
            productId: order.productId,
        });

        if (!product) {
            return responses(res, 404, "Product not found.");
        }

        const updatedQty =
            Number(product.quantity) + Number(order.quantity);

        let stockStatus = "";

        if (updatedQty === 0) {
            stockStatus = "Out of Stock";
        } else if (updatedQty <= 10) {
            stockStatus = "Low Stock";
        } else {
            stockStatus = "In Stock";
        }

        await Product.findByIdAndUpdate(
            product._id,
            {
                quantity: updatedQty,
                status: stockStatus,
            },
            { new: true }
        );

        // ==========================
        // ORDER
        // ==========================

        order.orderStatus = "Cancelled";

        await order.save();

        // ==========================
        // STOCK OUT
        // ==========================

        const stockOut = await StockOut.findOne({
            orderId: order.orderId,
        });

        if (stockOut) {

            stockOut.status = "Cancelled";

            await stockOut.save();

        }

        // ==========================
        // NOTIFICATION
        // ==========================

        await notificationModules.create({
            title: "Order Cancelled",
            message: `${order.product} order has been cancelled successfully.`,
            type: "ORDER_CANCELLED",
            role: req.user.role,
            userId: req.user.id,
        });

        return responses(
            res,
            200,
            "Order cancelled successfully.",
            order
        );

    } catch (error) {

        console.log(error);

        return responses(res, 500, "Internal Server Error");
    }
};