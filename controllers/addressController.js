import Address from "../models/Address.js"
import User from "../models/User.js"

const getDefaultShippingAddress = async (req, res) => {
    const userID = req.user.userId
    try {
        const user = await User.findById(userID).populate("defaultShippingAddress")
        if (!user) {
            return res.status(404).json({ message: "Unable to find user" })
        }
        res.status(200).json(user.defaultShippingAddress)
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Error in getting default shipping address" })
    }
}

const getDefaultBillingAddress = async (req, res) => {
    const userID = req.user.userId
    try {
        const user = await User.findById(userID).populate("defaultBillingAddress")
        if (!user) {
            return res.status(404).json({ message: "Unable to find user" })
        }
        res.status(200).json(user.defaultBillingAddress)
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Error in getting default billing address" })
    }
}

const setDefaultBillingAddress = async (req, res) => {
    try {
        const { addressId } = req.body;
        if (!addressId) {
            return res.status(400).json({ message: "Address ID is required" });
        }

        const address = await Address.findById(addressId);
        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }

        const actingUserId = req.user.userId;
        const isAdmin = req.user.role === "admin";

        if (!isAdmin && address.user.toString() !== actingUserId) {
            return res.status(403).json({ message: "You are not authorized to update this address" });
        }

        const targetUserId = address.user;

        await Address.updateMany(
            { user: targetUserId, _id: { $ne: addressId } },
            { $set: { defaultBillingAddress: false } }
        );

        address.defaultBillingAddress = true;
        await address.save();

        await User.findByIdAndUpdate(targetUserId, {
            defaultBillingAddress: address._id
        });

        res.status(200).json({ message: "Default billing address set successfully" });
    } catch (error) {
        console.error("Set default billing address error:", error.message);
        res.status(500).json({ message: "Failed to set default billing address" });
    }
};

const setDefaultShippingAddress = async (req, res) => {
    try {
        const { addressId } = req.body;
        if (!addressId) {
            return res.status(400).json({ message: "Address ID is required" });
        }

        const address = await Address.findById(addressId);
        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }

        const actingUserId = req.user.userId;
        const isAdmin = req.user.role === "admin";

        if (!isAdmin && address.user.toString() !== actingUserId) {
            return res.status(403).json({ message: "You are not authorized to update this address" });
        }

        const targetUserId = address.user;

        await Address.updateMany(
            { user: targetUserId, _id: { $ne: addressId } },
            { $set: { defaultShippingAddress: false } }
        );

        address.defaultShippingAddress = true;
        await address.save();

        await User.findByIdAndUpdate(targetUserId, {
            defaultShippingAddress: address._id
        });

        res.status(200).json({ message: "Default shipping address set successfully" });
    } catch (error) {
        console.error("Set default shipping address error:", error.message);
        res.status(500).json({ message: "Failed to set default shipping address" });
    }
};

const saveAddress = async (req, res) => {
    try {
        const targetUserID = req.body.userId || req.user.userId;

        const user = await User.findById(targetUserID);
        if (!user) {
            return res.status(404).json({ message: "Unable to find user" });
        }

        const newAddress = new Address({
            user: targetUserID,
            name: req.body.name,
            phoneNumber: req.body.phoneNumber,
            address: req.body.address,
            city: req.body.city,
            province: req.body.province,
            country: req.body.country,
            defaultBillingAddress: req.body.defaultBillingAddress || false,
            defaultShippingAddress: req.body.defaultShippingAddress || false,
        });

        await newAddress.save();

        res.status(200).json({ message: "New address saved successfully", addressID: newAddress.id });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Error in saving address" });
    }
};


const updateAddress = async (req, res) => {
    try {
        const {
            addressId,
            updatedData: {
                name,
                phoneNumber,
                address,
                city,
                province,
                country
            }
        } = req.body;
        console.log(req.body);
        console.log(address);
        if (!addressId) {
            return res.status(400).json({ message: "Address ID is required" });
        }

        const addressToUpdate = await Address.findById(addressId);
        if (!addressToUpdate) {
            return res.status(404).json({ message: "Address not found" });
        }

        const actingUserId = req.user.userId;
        const isAdmin = req.user.role === "admin";

        if (!isAdmin && addressToUpdate.user.toString() !== actingUserId) {
            return res.status(403).json({ message: "Unauthorized to update this address" });
        }

        if (isAdmin && req.body.userId && req.body.userId !== addressToUpdate.user.toString()) {
            return res.status(400).json({ message: "Address-user mismatch" });
        }
        console.log(`Name: ${name}, Phone Number: ${phoneNumber} , Address: ${address} , City: ${city} , Province ${province} Country: ${country}`)
        addressToUpdate.name = name || addressToUpdate.name;
        addressToUpdate.phoneNumber = phoneNumber || addressToUpdate.phoneNumber;
        addressToUpdate.address = address || addressToUpdate.address;
        addressToUpdate.city = city || addressToUpdate.city;
        addressToUpdate.province = province || addressToUpdate.province;
        addressToUpdate.country = country || addressToUpdate.country;
        console.log(addressToUpdate);
        await addressToUpdate.save();

        res.status(200).json({ message: "Address updated successfully" });

    } catch (error) {
        console.error("Update address error:", error.message);
        res.status(500).json({ message: "Error updating address" });
    }
};



const getUserAddresses = async (req, res) => {
    try {
        const isAdmin = req.user.role === "admin";
        const targetUserId = isAdmin && req.query.userId ? req.query.userId : req.user.userId;

        const addresses = await Address.find({ user: targetUserId });

        res.status(200).json({ addresses });
    } catch (error) {
        console.error("Error fetching addresses:", error.message);
        res.status(500).json({ message: "Failed to retrieve addresses" });
    }
}

const getAddressByID = async (req, res) => {
    try {
        const address = await Address.findById(req.params.addressID);
        if (!address) {
            return res.status(404).json({ message: "Requested resource not found" })
        }
        res.status(200).json(address)
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Error in fetching address by id" })
    }
}

export { getDefaultBillingAddress, setDefaultBillingAddress, getDefaultShippingAddress, setDefaultShippingAddress, saveAddress, updateAddress, getUserAddresses, getAddressByID }