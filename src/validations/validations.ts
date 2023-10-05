import { Request } from 'express';
import { HttpBadRequest } from '../utils/errors';

export const validateLoginInput = (req: Request): void => {
  if (!req.body.email_id) {
    throw new HttpBadRequest('Email ID is required');
  }
  if (!req.body.password) {
    throw new HttpBadRequest('Password is required');
  }
};

export const validateAddUserInput = (req: Request): void => {
  if (!req.body.user_name) {
    throw new HttpBadRequest('User name is required');
  }
  if (!req.body.email_id) {
    throw new HttpBadRequest('Email ID is required');
  }
  if (!req.body.password) {
    throw new HttpBadRequest('Password is required');
  }
};

export const validateUpdateUserInput = (req: Request): void => {
  if (!req.body.user_id) {
    throw new HttpBadRequest("User Id is required");
  }
  if (!req.body.user_name) {
    throw new HttpBadRequest('User name is required');
  }
  if (!req.body.email_id) {
    throw new HttpBadRequest('Email ID is required');
  }
};

export const validatePhotoUpload = (req: Request): void => {
  const allowedExtensions = ["jpg", "jpeg", "png"];

  if (!req.file) {
    throw new HttpBadRequest('Please select a photo to upload');
  }

  const fileExtension = req.file?.originalname.split(".").pop()?.toLowerCase();

  if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
    throw new HttpBadRequest('Only image files are allowed');
  }
};

export const validateAddHrProfileInput = (req: Request): void => {
  if (!req.body.email_id) {
    throw new HttpBadRequest('Email ID is required');
  }
};

export const validateUpdateHrProfileInput = (req: Request): void => {
  if (!req.body.hr_profile_id) {
    throw new HttpBadRequest('Profile Id is required');
  }
  if (!req.body.email_id) {
    throw new HttpBadRequest('Email ID is required');
  }
};