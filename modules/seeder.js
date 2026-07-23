
import bcrypt from "bcryptjs";
import register from "./authModules.js";

export const seedAdmin = async () => {
    try {
        const existingAdmin = await register.findOne({
            roleId: "1"
        });

        if (existingAdmin) {
            console.log("Admin already exists");
            return;
        }

        const password = "Admin@123";
        const hashPassword = await bcrypt.hash(password, 10);
        const lastregister = await register.findOne().sort({ createdAt: -1 });
        let count = 1;
        if (lastregister) {
            count = Number(lastregister.userId.split("-")[1]) + 1;
        }
        const currentAdminId = `ADM-${String(count).padStart(6, "0")}`;

        await register.create({
            userId: currentAdminId,
            userName: "Suresh",
            email: "ss9477157@gmail.com",
            phone: "6369722581",
            roleId: "1",
            role: "admin",
            status: "Active",
            password: hashPassword,
            image: ''
        });

        console.log("Admin created successfully");
    } catch (error) {
        console.log("Seeder Error:", error);
    }
};