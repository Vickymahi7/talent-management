let addressList = require('../models/addressList.json');
let addressIdCount = 1;

const getAddressList = async (req, res, next) => {
    try {
        res.status(200).json({ addressList });
    } catch (error) {
        next(error);
    }
}

const addressAdd = async (req, res, next) => {
    try {
        const addressId = addressList.length + 1;
        addressIdCount++;
        let address = { ...req.body, address_id: addressIdCount, address_id: addressId, };
        addressList.push(address);

        res.status(201).json({ message: 'Address Created Successfully' });
    } catch (error) {
        next(error);
    }
}

const addressUpdate = async (req, res, next) => {
    try {
        let address = req.body;
        if (addressList.length > 0 && address.address_id) {
            let addressData = addressList.find(data => data.address_id == address.address_id);
            if (addressData && addressData.address_id) {
                addressList = addressList.map(data => {
                    if (data.address_id == address.address_id) {
                        data = address;
                    }
                    return data;
                })
                return res.status(200).json({ message: 'Address Updated Successfully' });
            }
        }
        res.status(404).json({ message: 'Record not found' });
    } catch (error) {
        next(error);
    }
}

const addressView = async (req, res, next) => {
    try {
        let addressId = req.params.id;
        if (addressList.length > 0 && addressId) {
            const address = addressList.find(data => data.address_id == addressId);
            if (address && address.address_id) {
                return res.status(200).json({ address });
            }
        }
        res.status(404).json({ message: 'Record not found' });
    } catch (error) {
        next(error);
    }
}

const addressDelete = async (req, res, next) => {
    let addressId = req.params.id;
    try {
        if (addressList.length > 0 && addressId) {
            let addressData = addressList.find(data => data.address_id == addressId);
            if (addressData && addressData.address_id) {
                addressList = addressList.filter(data => data.address_id != addressId);
                return res.status(200).json({ message: 'Address Deleted Successfully' });
            }
        }
        res.status(404).json({ message: 'Record not found' });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAddressList,
    addressAdd,
    addressUpdate,
    addressView,
    addressDelete,
}