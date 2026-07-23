import Supplier from "../modules/supplierModule.js";
import { responses } from "../utlies/response.js";

export const addSupplier = async (req, res) => {
    try {
        const {supplierId, supplierName, email, phone, address, status } = req.body;
        const mobileRegex = /^[6-9]\d{9}$/;

        if (!supplierName) return responses(res, 400, "Supplier name is required")
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) return responses(res, 400, "Please enter valid email")
        if (!email) return responses(res, 400, "email is required")
        if (!mobileRegex.test(phone)) return responses(res, 400, "Please enter valid mobile number start with[6-9], and minimum 10 number only")
        if (!phone) return responses(res, 400, "phone number is required")
        if (!address) return responses(res, 400, "address is required")
        if (!status) return responses(res, 400, "status is required")

        const existSupplier = await Supplier.findOne({
            $or: [{ email: email.toLowerCase().trim() }, { phone }]
        });

        if (existSupplier)
            return responses(res, 400, " already exists with email or phone number");

        const lastSupplier = await Supplier.findOne().sort({ createdAt: -1 });
        let count = 1;
        if (lastSupplier) {
            count = Number(lastSupplier.supplierId.split("-")[1]) + 1;
        }
        const currentSupplierId = `SUP-${String(count).padStart(6, "0")}`;

        const supplier = await Supplier.create({
            supplierId:currentSupplierId,
            supplierName: supplierName.trim(),
            email: email.toLowerCase().trim(),
            phone,
            address,
            status: status === "Inactive" ? "Active" : "Active"
        });

        return responses(res, 201, "Supplier created successfully", supplier);
    } catch (error) {
        console.log(error);
        return responses(res, 500, "Internal Server Error");
    }
}

export const getAllSupplier = async (req, res) => {

    try {
        const currentPage = Number(req.query.currentPage) || 1;
        const limit = Number(req.query.limit) || 5;
        const search = req.query.search || "";

        console.log(req.query.search);
        const skip = (currentPage - 1) * limit;

        const filter = {};

        if (search) {
            filter.supplierId = {
                $regex: search,
                $options: "i",
            };
        }

        const total = await Supplier.countDocuments(filter);

        const supplierData = await Supplier.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: 1 });

        return responses(res, 200, "Supplier fetched", {
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

export const getSupplierCount = async (req, res) => {
    try {
        const totalSuppliers = await Supplier.countDocuments();
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        const todaySuppliers = await Supplier.countDocuments({
            createdAt: {
                $gte: startOfDay,
                $lt: endOfDay,
            },
        });

        return responses(res, 200, "Supplier count fetched successfully", {
            totalSuppliers,
            todaySuppliers,
        });

    } catch (error) {
        return responses(res, 500, "Internal Server Error");
    }
}


export const updateSupplier = async (req, res) => {
    const { supplierName, email, phone, address, status } = req.body
    const { id } = req.params
    const supplierData = await Supplier.findById(id);
    if (!supplierData) return responses(res, 400, "No supplier found");
    try {
        const supplierUpdate = await Supplier.findByIdAndUpdate(id, { supplierName, email: email.toLowerCase().trim(), phone, address, status }, { new: true, runValidators: true, });
        if (!supplierUpdate) {
            return responses(res, 404, "Supplier not found", []);
        }
        return responses(res, 200, "Supplier update successfully", supplierUpdate);
    } catch (error) {
        return responses(res, 500, "Internal Server Error");
    }
}

export const deleteSupplier = async (req, res) => {
    const { id } = req.params
    try {
        const supplierDelete = await Supplier.findByIdAndDelete(id);
        if (!supplierDelete) {
            return responses(res, 404, "Supplier not found");
        }
        return responses(res, 200, "Supplier deleted successfully", supplierDelete);
    } catch (error) {
        return responses(res, 500, "Internal Server Error");
    }
}

export const softUpdateSupplier = async (req, res) => {
    const { status } = req.body
    const { id } = req.params
    const supplierData = await Supplier.findById(id);
    try {
        const supplierSoftUpdate = await Supplier.findByIdAndUpdate(id, { status }, { new: true, runValidators: true, });
        if (!supplierSoftUpdate) {
            return responses(res, 404, "Supplier not found");
        }
        return responses(res, 200, "Supplier status updated successfully", supplierSoftUpdate);
    } catch (error) {
        return responses(res, 500, "Internal Server Error");
    }
}