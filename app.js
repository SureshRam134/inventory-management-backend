import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fs from "fs";
import authRoute from './routes/authRoutes.js'
import connectDb from './config/db.js'
import { seedAdmin } from './modules/seeder.js'
import categoriesRoutes from './routes/categoriesRoutes.js'
import productRoutes from './routes/productRoutes.js'
import supplierRoute from './routes/supplierRoute.js'
import ordersRoutes from './routes/ordersRoutes.js'
import stockInRoutes from './routes/stockInRoutes.js'
import stockOutRoutes from './routes/stockOutRoutes.js'
import authUserRoutes from './routes/authUserRoutes.js'
import profileRoutes from './routes/profileRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import outOfStockRoutes from './routes/outOfStockRoutes.js'
import chartRoutes from './routes/chartRoutes.js'

dotenv.config()
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}
const allow = {
    origin: "http://localhost:5173","https://inventory-management-frontend-ggx49ratp.vercel.app",
    methods: ["POST", "GET", "PUT", "PATCH", "DELETE"]
}
const server = express()
const PORT = process.env.PORT || 4000
server.use(cors(allow))
server.use(express.json())
server.use("/uploads", express.static("uploads"));

server.use('/api/user', authRoute)

server.use('/api/admin/category', categoriesRoutes)
server.use('/api/user/category', categoriesRoutes)

server.use('/api/admin/product', productRoutes)
server.use('/api/user/product', productRoutes)

server.use('/api/admin/supplier', supplierRoute)
server.use('/api/user/supplier', supplierRoute)

server.use('/api/admin/orders', ordersRoutes)
server.use('/api/user/orders', ordersRoutes)

server.use('/api/admin/stockin', stockInRoutes)
server.use('/api/user/stockin', stockInRoutes)

server.use('/api/admin/stockout', stockOutRoutes)
server.use('/api/user/stockout', stockOutRoutes)

server.use('/api/admin/user', authUserRoutes)
server.use('/api/user/user', authUserRoutes)

server.use('/api/admin/profile', profileRoutes)
server.use('/api/user/profile', profileRoutes)

server.use('/api/admin/notifications', notificationRoutes)
server.use('/api/user/notifications', notificationRoutes)

server.use('/api/admin/outofstock', outOfStockRoutes)
server.use('/api/user/outofstock', outOfStockRoutes)

server.use('/api/admin/dashboard', chartRoutes)
server.use('/api/user/dashboard', chartRoutes)

const startServer = async () => {
    await connectDb();
    await seedAdmin();

    server.listen(PORT, () => {
        console.log(`http://localhost:${PORT}`);
    });
};

startServer();