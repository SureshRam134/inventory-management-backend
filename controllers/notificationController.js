import notificationModules from "../modules/notificationModules.js";
import { responses } from "../utlies/response.js";


export const getAllNotifications = async (req, res) => {

    const limit = Number(req.query.limit) || 50;
    try {
        const notification = await notificationModules
            .find({
                userId: req.user.id,
                role: req.user.role
            })
            .limit(limit)
            .sort({ createdAt: -1 });

        if (!notification) return responses(res, 404, " notification not found");

        return responses(res, 200, "Latest notification fetched successfully", notification);

    } catch (error) {
        return responses(res, 500, "Internal Server Error");
    }
}

export const getNotificationsCount = async (req, res) => {
    try {
        const count = await notificationModules.countDocuments({
            userId: req.user.id,
            role: req.user.role,
            isRead: false,
        });

        const notificationCount = Math.min(count, 50);

        return responses(res, 200, "Notification count fetched successfully.", {
            count: notificationCount,
        });

    } catch (error) {
        console.log(error);
        return responses(res, 500, "Internal Server Error");
    }
};


export const getLowStockNotification = async (req, res) => {
    try {
        const notification = await notificationModules
            .findOne({
                type: "LOW_STOCK",
                userId: req.user.id,
                role: req.user.role,
            })
            .sort({ createdAt: -1 })
            .limit(1)

        if (!notification) return responses(res, 404, " notification not found");

        return responses(res, 200, "Latest notification fetched successfully", notification);

    } catch (error) {
        return responses(res, 500, "Internal Server Error");
    }
};

export const getNewOrderNotification = async (req, res) => {
    try {
        const notification = await notificationModules
            .findOne({
                type: "NEW_ORDER",
                userId: req.user.id,
                role: req.user.role,
            })
            .sort({ createdAt: -1 })
            .limit(1)

        if (!notification) return responses(res, 404, " notification not found");

        return responses(res, 200, "Latest notification fetched successfully", notification);

    } catch (error) {
        return responses(res, 500, "Internal Server Error");
    }
};
export const getNewUserNotification = async (req, res) => {
    try {
        const notification = await notificationModules
            .findOne({
                type: "NEW_USER",
                userId: req.user.id,
                role: req.user.role,
            })
            .sort({ createdAt: -1 })
            .limit(1)

        if (!notification) return responses(res, 404, " notification not found");

        return responses(res, 200, "Latest notification fetched successfully", notification);

    } catch (error) {
        return responses(res, 500, "Internal Server Error");
    }
};

export const getStockinNotification = async (req, res) => {
    try {
        const notification = await notificationModules
            .findOne({
                type: "STOCK_IN",
                userId: req.user.id,
                role: req.user.role,

            })
            .sort({ createdAt: -1 })
            .limit(1)

        if (!notification) return responses(res, 404, " notification not found", {});

        return responses(res, 200, "Latest notification fetched successfully", notification);

    } catch (error) {
        return responses(res, 500, "Internal Server Error");
    }
};

export const getOrderCancelledNotification = async (req, res) => {
    try {
        const notifications = await notificationModules.find({
            type: "ORDER_CANCELLED",
            userId: req.user.id,
            role: req.user.role,
        }).sort({ createdAt: -1 })
        .limit(1)

        return responses(res, 200, "Order cancelled notifications fetched successfully", notifications);
    } catch (error) {
        return responses(res, 500, "Internal Server Error");
    }
};

export const getOrderReturnedNotification = async (req, res) => {
    try {
        const notifications = await notificationModules.find({
            type: "ORDER_RETURNED",
            userId: req.user.id,
            role: req.user.role,
        }).sort({ createdAt: -1 })
        .limit(1)

        return responses(res, 200, "Order returned notifications fetched successfully", notifications);
    } catch (error) {
        return responses(res, 500, "Internal Server Error");
    }
};

export const markAsRead = async (req, res) => {
    const { isRead } = req.body
    const { id } = req.params
    const notifyData = await notificationModules.findById(id);
    if (!notifyData) {
        return responses(res, 404, "notification not found");
    }
    try {
        const isReadUpdate = await notificationModules.findByIdAndUpdate(notifyData._id, { isRead }, { new: true, runValidators: true, });
        if (!isReadUpdate) {
            return responses(res, 404, "notification not found");
        }
        return responses(res, 200, "notification status updated successfully", isReadUpdate);
    } catch (error) {
        return responses(res, 500, "Internal Server Error");
    }
}


export const deleteNotification = async (req, res) => {
    try {

        const { id } = req.params;
        console.log(id);
        

        const notification = await notificationModules.findOneAndDelete({
            _id:id,
            userId: req.user.id,
            role: req.user.role,
        });

        if (!notification) {
            return responses(res, 404, "Notification not found or access denied");
        }

        return responses(res, 200, "Notification deleted successfully.", notification);

    } catch (error) {
        console.log(error);
        return responses(res, 500, "Internal Server Error");
    }
};

export const deleteAllNotifications = async (req, res) => {
    try {

        await notificationModules.deleteMany({
            userId: req.user.id,
            role: req.user.role,
        });

        return responses(res, 200, "All notifications deleted successfully.");

    } catch (error) {
        console.log(error);
        return responses(res, 500, "Internal Server Error");
    }
};
