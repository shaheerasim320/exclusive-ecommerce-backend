const getAdminDashboard = async (req, res) => {
    return res.status(200).json({ message: "Hello World" })
}

export { getAdminDashboard }