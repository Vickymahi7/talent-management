let contactList = require('../models/contactList.json');
let contactIdCount = 1;

const getContactList = async (req, res, next) => {
    try {
        res.status(200).json({ contactList });
    } catch (error) {
        next(error);
    }
}

const contactAdd = async (req, res, next) => {
    try {
        if (!req.body.email_id || req.body.email_id == '') {
            res.status(400).json({ message: 'Email Id is required' });
        }
        else {
            contactIdCount++;
            let contact = { ...req.body, contact_id: contactIdCount, address_id: contactIdCount, };
            contactList.push(contact);

            res.status(201).json({ message: 'Contact Created Successfully' });
        }
    } catch (error) {
        next(error);
    }
}

const contactUpdate = async (req, res, next) => {
    try {
        let contact = req.body;
        if (contactList.length > 0 && contact.contact_id) {
            let contactData = contactList.find(data => data.contact_id == contact.contact_id);
            if (contactData && contactData.contact_id) {
                contactList = contactList.map(data => {
                    if (data.contact_id == contact.contact_id) {
                        data = contact;
                    }
                    return data;
                })
                return res.status(200).json({ message: 'Contact Updated Successfully' });
            }
        }
        res.status(404).json({ message: 'Record not found' });
    } catch (error) {
        next(error);
    }
}

const contactView = async (req, res, next) => {
    try {
        let contactId = req.params.id;
        if (contactList.length > 0 && contactId) {
            const contact = contactList.find(data => data.contact_id == contactId);
            if (contact && contact.contact_id) {
                return res.status(200).json({ contact });
            }
        }
        res.status(404).json({ message: 'Record not found' });
    } catch (error) {
        next(error);
    }
}

const contactDelete = async (req, res, next) => {
    let contactId = req.params.id;
    try {
        if (contactList.length > 0 && contactId) {
            let contactData = contactList.find(data => data.contact_id == contactId);
            if (contactData && contactData.contact_id) {
                contactList = contactList.filter(data => data.contact_id != contactId);
                return res.status(200).json({ message: 'Contact Deleted Successfully' });
            }
        }
        res.status(404).json({ message: 'Record not found' });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getContactList,
    contactAdd,
    contactUpdate,
    contactView,
    contactDelete,
}