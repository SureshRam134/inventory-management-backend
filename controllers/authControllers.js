import { responses } from "../utlies/response.js";
import jwt from 'jsonwebtoken'
import bcrypt from "bcryptjs";
import register from "../modules/authModules.js";
import { checkMail } from "../services/emailAccess.js";
import fs from "fs";
import path from "path";
import notificationModules from "../modules/notificationModules.js";


export const userRegister = async (req, res) => {
    const { userId, userName, email, phone, roleId, role, status, password } = req.body
    const image = req.file ? req.file.filename : "";
    const mobileRegex = /^[6-9]\d{9}$/;

    try {
        if (!userName) return responses(res, 400, "Please enter user name")
        if (!email) return responses(res, 400, "Please enter email")
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) return responses(res, 400, "Please enter valid email")
        if (!phone) return responses(res, 400, "Please enter phone number")
        if (!mobileRegex.test(phone)) return responses(res, 400, "Please enter valid mobile number")
        if (!roleId) return responses(res, 400, "Please enter roleId")
        if (!role) return responses(res, 400, "Please enter role")
        if (!status) return responses(res, 400, "Please enter status")

        const existingEmployee = await register.findOne({ $or: [{ email }, { phone }] });
        if (existingEmployee) return responses(res, 400, "already exists with email or phone number");
        const currentEmail = email.toLowerCase().trim();
        const lastregister = await register.findOne().sort({ createdAt: -1 });
        let count = 1;
        if (lastregister) {
            count = Number(lastregister.userId.split("-")[1]) + 1;
        }
        const currentUserId = `USR-${String(count).padStart(6, "0")}`;
        await register.create({
            userId: currentUserId, userName, email: currentEmail, phone, roleId, role, status, image, password
        });
        await notificationModules.create({
            title: "New User",
            message: `${userName} has been registered successfully.`,
            type: "NEW_USER",
            role: req.user.role,
            userId: req.user.id,
        });

        return responses(res, 201, "User Create successfully");
    } catch (error) {
        console.log(error);
        return responses(res, 500, "Internal Server Error");
    }
}

export const getAllUser = async (req, res) => {

    try {
        const currentPage = Number(req.query.currentPage) || 1;
        const limit = Number(req.query.limit) || 5;
        const search = req.query.search || "";
        const skip = (currentPage - 1) * limit;

        const filter = {};

        if (search) {
            filter.$or = [

                {
                    userId: {
                        $regex: search,
                        $options: "i",
                    }
                }, {
                    phone: {
                        $regex: search,
                        $options: "i",
                    }
                }, {
                    email: {
                        $regex: search,
                        $options: "i",
                    }
                }
            ]

        }

        const total = await register.countDocuments(filter);

        const supplierData = await register.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: 1 });

        return responses(res, 200, "Register fetched", {
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

export const getUsersCount = async (req, res) => {
    try {
        const totalUsers = await register.countDocuments();
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        const todayUsers = await register.countDocuments({
            createdAt: {
                $gte: startOfDay,
                $lt: endOfDay,
            },
        });

        return responses(res, 200, "User count fetched successfully", {
            totalUsers,
            todayUsers,
        });

    } catch (error) {
        return responses(res, 500, "Internal Server Error");
    }
}


export const checkEmailFunction = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email)
            return responses(res, 400, "Please enter email");

        const emailRegex =
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;

        if (!emailRegex.test(email))
            return responses(res, 400, "Please enter valid email");

        const currentEmail = email.toLowerCase().trim();
        const user = await register.findOne({
            email: currentEmail
        });
        if (!user) return responses(res, 400, "Email not found");
        if (user.status === "Inactive") return responses(res, 403, "Your account has been deactivated. Please contact the administrator.");

        if (user.roleId == 2) {
            // OTP generate
            const otp = Math.floor(100000 + Math.random() * 900000);
            const otpExpire = Date.now() + 5 * 60 * 1000;

            await register.findOneAndUpdate(
                { email: currentEmail }, { otp, otpExpire }, { new: true }
            );

            const transporter = checkMail(res)
            transporter.verify((error, success) => {
                if (error) {
                    console.log("SMTP Verify Error:", error);
                } else {
                    console.log("SMTP Ready");
                }
            });
            const MailSenderMsg = {
                from: process.env.SMTP_USER,
                to: email,
                subject: 'Inventory Management System - Your One-Time Password (OTP)',
                text: `Dear User,
                
We received a request to verify your account for the Inventory Management System.

Your One-Time Password (OTP) is:

${otp}

This OTP is valid for the next 5 minutes.

For your security:
• Do not share this OTP with anyone.
• Our team will never ask for your OTP.
• If you did not request this verification, please ignore this email.

Thank you,
Inventory Management System Team`
            };
            await transporter.sendMail(MailSenderMsg)
            const payload = {
                roleId: user.roleId,
                otp: otp
            }
            return responses(res, 200, "Inventory management otp send to your mail", payload)
        }
        else {
            const payload = {
                roleId: user.roleId,
            }
            return responses(res, 200, "Email successfully verified ", payload)
        }

    } catch (error) {
        console.log(error);
        return responses(res, 500, "Internal Server Error");
    }

}

export const passwordVerifiFunction = async (req, res) => {

    try {
        const { password, email } = req.body
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;
        if (!emailRegex.test(email)) return responses(res, 400, "Please enter valid email");
        if (!/(?=.*[a-z])/.test(password)) return responses(res, 400, "Must have one small character ")
        if (!/(?=.*[A-Z])/.test(password)) return responses(res, 400, "Must have one capital character ")
        if (!/(?=.*[@#$%^&!])/.test(password)) return responses(res, 400, "Must have one special character")
        if (!/(?=.*\d)/.test(password)) return responses(res, 400, "Must have one number ")
        if (password.length < 8) return responses(res, 400, "Must have min 8 character")

        const currentEmail = email.toLowerCase().trim();
        const dbData = await register.findOne({
            email: currentEmail
        });

        const isMatch = await bcrypt.compare(password, dbData.password)
        console.log(isMatch);
        if (!isMatch) return responses(res, 400, "Invalid credentials")
        const token = jwt.sign({ id: dbData?.id, email: dbData?.email, roleId: dbData?.roleId, role: dbData?.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXP })
        const data = {
            name: dbData?.name,
            email: dbData?.email,
            roleId: dbData?.roleId,
            role: dbData?.role,
            token: token,
            status: dbData?.status
        }
        return responses(res, 200, " successfully Login", data)

    } catch (error) {
        console.log(error);
        return responses(res, 500, "Internal Server Error");
    }

}


export const otpVerifiFunction = async (req, res) => {
    try {
        const { otp, email } = req.body
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;
        if (!emailRegex.test(email)) return responses(res, 400, "Please enter valid email");

        const currentEmail = email.toLowerCase().trim();
        const dbData = await register.findOne({
            email: currentEmail
        });

        const currentExpire = Date.now()
        if (otp != dbData?.otp) return responses(res, 400, "OTP invaild, Please enter valid otp");
        if (currentExpire > dbData.otpExpire) return responses(res, 400, "OTP Expire, Please give resend otp");

        const token = jwt.sign({ id: dbData?.id, email: dbData?.email, roleId: dbData?.roleId, role: dbData?.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXP })
        const data = {
            name: dbData?.name,
            email: dbData?.email,
            roleId: dbData?.roleId,
            role: dbData?.role,
            token: token,
            status: dbData?.status
        }
        return responses(res, 200, "successfully Login", data)


    } catch (error) {
        console.log(error);
        return responses(res, 500, "Internal Server Error");
    }
}


export const updateUser = async (req, res) => {

    const { userId, userName, email, phone, roleId, role, status, password } = req.body
    const image = req.file ? req.file.filename : "";
    const { id } = req.params

    try {
        const userData = await register.findById(id);
        if (!userData) return responses(res, 400, "No user found");
        const userUpdate = await register.findByIdAndUpdate(id, { userId, userName, email, phone, roleId, role, status, password, image }, { new: true, runValidators: true, });
        if (!userUpdate) {
            return responses(res, 404, "User not found", []);
        }
        return responses(res, 200, "User update successfully", userUpdate);
    } catch (error) {
        return responses(res, 500, "Internal Server Error");
    }
}

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await register.findById(id);

        if (!user) {
            return responses(res, 404, "User not found");
        }

        if (user.image) {
            const imagePath = path.join("uploads", user.image);

            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        const userDelete = await register.findByIdAndDelete(id);

        return responses(res, 200, "User deleted successfully", userDelete);
    } catch (error) {
        console.log(error);
        return responses(res, 500, "Internal Server Error");
    }
};


export const softUpdateUser = async (req, res) => {
    const { status } = req.body
    const { id } = req.params
    const userData = await register.findById(id);
    if (!userData) return responses(res, 404, "User not found");
    try {
        const userSoftUpdate = await register.findByIdAndUpdate(id, { status }, { new: true, runValidators: true, });
        if (!userSoftUpdate) {
            return responses(res, 404, "User not found");
        }
        return responses(res, 200, "User status updated successfully", userSoftUpdate);
    } catch (error) {
        return responses(res, 500, "Internal Server Error");
    }
}