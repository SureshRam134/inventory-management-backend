import express from "express";
import { getAllNotifications, markAsRead, deleteNotification, getLowStockNotification, getNewOrderNotification, getNewUserNotification, getStockinNotification, deleteAllNotifications, getNotificationsCount, getOrderCancelledNotification, getOrderReturnedNotification } from "../controllers/notificationController.js";
import { authorizationFunction } from "../middleware/tokenMiddleware.js";


const notificationRoutes = express.Router();

notificationRoutes.get("/all", authorizationFunction, getAllNotifications);
notificationRoutes.get("/count", authorizationFunction, getNotificationsCount);
notificationRoutes.get("/lowstack", authorizationFunction, getLowStockNotification);
notificationRoutes.get("/neworder", authorizationFunction, getNewOrderNotification);
notificationRoutes.get("/newuser", authorizationFunction, getNewUserNotification);
notificationRoutes.get("/stockin", authorizationFunction, getStockinNotification);
notificationRoutes.get("/ordercancelled", authorizationFunction, getOrderCancelledNotification);
notificationRoutes.get("/orderreturned", authorizationFunction, getOrderReturnedNotification);

notificationRoutes.patch("/isread/:id", authorizationFunction, markAsRead);

notificationRoutes.delete("/delete/:id", authorizationFunction, deleteNotification);
notificationRoutes.delete( "/deleteall", authorizationFunction, deleteAllNotifications );

export default notificationRoutes;
