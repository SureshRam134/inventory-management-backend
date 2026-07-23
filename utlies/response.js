
export const responses = (res, status, msg, data) => {
    return res.status(status).json({status: 400 > status, message:msg, result:data})
}