import register from "../modules/authModules.js";
import { responses } from "../utlies/response.js";




export const getCurrentProfile = async (req, res) => {

    try {
        const user = await register.findById(req.user.id)
        
        if (!user) {
            return responses(res, 404, "User not found");
        }

        return responses(res, 200, "Profile fetched successfully", user);

    } catch (error) {
        console.log(error);
        return responses(res, 500, "Internal Server Error");
    }
};


export const updateProfile = async (req, res) => {
    
    const { userId, userName, email, phone, roleId, role, status, password } = req.body
    const image = req.file ? req.file.filename : "";
    const userData = await register.findById(req.user.id);
    if (!userData) return responses(res, 400, "No user found");
    try {
        const userUpdate = await register.findByIdAndUpdate(userData._id, { userId, userName, email, phone, roleId, role, status, password, image }, { new: true, runValidators: true, });
        if (!userUpdate) {
            return responses(res, 404, "User not found", []);
        }
        return responses(res, 200, "User update successfully", userUpdate);
    } catch (error) {
        return responses(res, 500, "Internal Server Error");
    }
}