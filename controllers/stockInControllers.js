import notificationModules from "../modules/notificationModules.js";
import Order from "../modules/ordersModules.js";
import OutOfStock from "../modules/outOfStockModules.js";
import Product from "../modules/productModules.js";
import StockIn from "../modules/stockinModules.js";
import Supplier from "../modules/supplierModule.js";
import { responses } from "../utlies/response.js";


export const getProduct = async (req, res) => {

    try {
        const productData = await Product.find()
        if (!productData) return responses(res, 404, "Product Not Found");
        return responses(res, 200, "Product fetched", productData);

    } catch (error) {
        console.log(error);
        return responses(res, 500, "Internal Server Error");
    }

}

export const getSupplier = async (req, res) => {

    try {
        const supplierData = await Supplier.find()
        if (!supplierData) return responses(res, 404, "Supplier Not Found");
        return responses(res, 200, "Supplier fetched", supplierData);

    } catch (error) {
        console.log(error);
        return responses(res, 500, "Internal Server Error");
    }

}

export const addStockIn = async (req, res) => {
    try {

        const { product, supplier, quantity, price, totalAmount, receivedDate, invoiceNo, status, remarks, } = req.body;

        if (!product) return responses(res, 400, "Please enter product name");
        if (!supplier) return responses(res, 400, "Please enter supplier name");
        if (!quantity) return responses(res, 400, "Please enter quantity");
        if (!price) return responses(res, 400, "Please enter price");
        if (!invoiceNo) return responses(res, 400, "Please enter invoice number");

        const currentSupplier = await Supplier.findOne({
            supplierName: supplier,
        });

        const currentProduct = await Product.findOne({
            productName: product,
        });

        if (!currentSupplier || !currentProduct) return responses(res, 404, "Product or Supplier not found");
        if (currentSupplier.supplierId !== currentProduct.supplierId) return responses(res, 400, "Cannot match supplier with product.");

        let availableQty =
            Number(currentProduct.quantity) + Number(quantity);

        let stockStatus = "";

        if (availableQty === 0) {
            stockStatus = "Out of Stock";
        } else if (availableQty <= 10) {
            stockStatus = "Low Stock";
        } else {
            stockStatus = "In Stock";
        }

        await Product.findByIdAndUpdate(currentProduct._id, { quantity: availableQty, status: stockStatus, price, }, { new: true, });

        const lastStockIn = await StockIn.findOne().sort({
            createdAt: -1,
        });

        let count = 1;

        if (lastStockIn) {
            count =
                Number(
                    lastStockIn.stockInId.split("-")[1]
                ) + 1;
        }

        const currentStockInId = `SUP-${String(count).padStart(
            6,
            "0"
        )}`;

        const stockInData = await StockIn.create({
            stockInId: currentStockInId,
            product,
            productId: currentProduct.productId,
            supplier,
            supplierId: currentSupplier.supplierId,
            quantity,
            price,
            totalAmount,
            receivedDate,
            invoiceNo,
            status,
            remarks,
            receivedBy: "",
            role: "",
            image: currentProduct.image,
            description: currentProduct.description,
        });

        await notificationModules.create({
            title: "Stock In",
            message: `${currentProduct.productName} stock updated with ${quantity} units.`,
            type: "STOCK_IN",
            role: req.user.role,
            userId: req.user.id,
        });

        const pendingOrders = await OutOfStock.find({
            productId: currentProduct.productId,
            status: "Pending",
        }).sort({ createdAt: 1, });

        let latestProduct = await Product.findById(currentProduct._id);

        for (const pending of pendingOrders) {

            latestProduct = await Product.findById(currentProduct._id);

            if (latestProduct.quantity < pending.orderQuantity) {
                break;
            }

            const balanceQty =
                Number(latestProduct.quantity) -
                Number(pending.orderQuantity);

            let balanceStatus = "In Stock";

            if (balanceQty === 0) {
                balanceStatus = "Out of Stock";
            } else if (balanceQty <= 10) {
                balanceStatus = "Low Stock";
            }

            await Product.findByIdAndUpdate(
                latestProduct._id,
                {
                    quantity: balanceQty,
                    status: balanceStatus,
                },
                { new: true }
            );

            const total = Number(latestProduct.price) * Number(pending.orderQuantity);
            let orderCount = await Order.countDocuments();
            orderCount++;

            const currentOrderId = `ORD-${String(orderCount).padStart(6, "0")}`;

            await Order.create({
                orderId: currentOrderId,
                productId: pending.productId,
                product: pending.productName,
                description: latestProduct.description,
                price: latestProduct.price,
                customerName: pending.customerName,
                email: pending.email,
                phone: pending.phone,
                quantity: pending.orderQuantity,
                totalAmount: total,
                paymentStatus: "Pending",
                orderStatus: "Pending",
                supplierId: pending.supplierId,
                checkStock: "Stock In",
                address: pending.address,
                image: pending.image,
            });

            await OutOfStock.findByIdAndDelete(pending._id);

            await notificationModules.create({
                title: "New Order",
                message: `${pending.productName} has been moved from Out Of Stock to Orders.`,
                type: "NEW_ORDER",
                role: req.user.role,
                userId: req.user.id,
            });
        }

        return responses(
            res,
            201,
            "StockIn created successfully",
            stockInData
        );

    } catch (error) {
        console.log(error);
        return responses(res, 500, "Internal Server Error");
    }
};


export const getAllStockIn = async (req, res) => {

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

        const total = await StockIn.countDocuments(filter);

        const supplierData = await StockIn.find(filter)
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


export const softUpdateStockIn = async (req, res) => {
    const { status } = req.body
    const { id } = req.params
    console.log(status, 989);

    const stockInData = await StockIn.findById(id);
    if (!stockInData) {
        return responses(res, 404, "StockIn not found");
    }
    const currentProduct = await Product.findOne({ productId: stockInData.productId });
    if (!currentProduct) {
        return responses(res, 404, "Product not found");
    }

    const updateQuantity = status === "Return" ? Number(currentProduct.quantity) - Number(stockInData.quantity) :
        Number(currentProduct.quantity) + Number(stockInData.quantity)

    let stockStatus = ""
    if (Number(updateQuantity) === 0) {
        stockStatus = "Out of Stock";
    } else if (Number(updateQuantity) <= 10) {
        stockStatus = "Low Stock";
    } else {
        stockStatus = "In Stock";
    }

    try {
        await Product.findByIdAndUpdate(currentProduct._id, { quantity: updateQuantity, status: stockStatus }, { new: true })

        const stockInSoftUpdate = await StockIn.findByIdAndUpdate(id, { status }, { returnDocument: "after", runValidators: true, });

        return responses(res, 200, "StockIn status updated successfully", stockInSoftUpdate);
    } catch (error) {
        return responses(res, 500, "Internal Server Error");
    }
}



