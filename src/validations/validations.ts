import { Request } from "express";
import { HttpBadRequest } from "../types/errors";
import Tenant from "../models/Tenant";
import User from "../models/User";

export const validateAddTenantInput = (tenant: Tenant): void => {
  if (!tenant.name) {
    throw new HttpBadRequest("Name is required");
  }
};

export const validateUpdateTenantInput = (tenant: Tenant): void => {
  if (!tenant.tenant_id) {
    throw new HttpBadRequest("Tenant Id is required");
  }
  if (!tenant.name) {
    throw new HttpBadRequest("Name is required");
  }
  if (tenant.hasOwnProperty("tenant_status_id") && !tenant.tenant_status_id) {
    throw new HttpBadRequest("Tenant Status is required");
  }
};

export const validateLoginInput = (
  email_id: string,
  password: string
): void => {
  if (!email_id) {
    throw new HttpBadRequest("Email ID is required");
  }
  if (!password) {
    throw new HttpBadRequest("Password is required");
  }
};

export const validateAddUserInput = (user: User): void => {
  if (!user.user_name) {
    throw new HttpBadRequest("User name is required");
  }
  if (!user.email_id) {
    throw new HttpBadRequest("Email ID is required");
  }
};

export const validateUpdateUserInput = (user: User): void => {
  if (!user.user_id) {
    throw new HttpBadRequest("User Id is required");
  }
  if (!user.user_name) {
    throw new HttpBadRequest("User name is required");
  }
  if (!user.email_id) {
    throw new HttpBadRequest("Email ID is required");
  }
  if (user.hasOwnProperty("user_status_id") && !user.user_status_id) {
    throw new HttpBadRequest("User Status is required");
  }
  if (user.hasOwnProperty("user_type_id") && !user.user_type_id) {
    throw new HttpBadRequest("User Type is required");
  }
};

export const validatePhotoUpload = (req: Request): void => {
  const allowedExtensions = ["jpg", "jpeg", "png"];

  if (!req.file) {
    throw new HttpBadRequest("Please select a photo to upload");
  }

  const fileExtension = req.file?.originalname.split(".").pop()?.toLowerCase();

  if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
    throw new HttpBadRequest("Unsupported File Format");
  }
};

export const validateResumeUpload = (req: Request): void => {
  const allowedExtensions = ["pdf", "doc", "docx", "txt"];

  if (!req.file) {
    throw new HttpBadRequest("Please select a resume to upload");
  }

  const fileExtension = req.file?.originalname.split(".").pop()?.toLowerCase();

  if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
    throw new HttpBadRequest("Unsupported File Format");
  }
};

export const validateDocUpload = (req: Request): void => {
  const allowedExtensions = ["pdf", "doc", "docx", "txt", "jpg", "jpeg", "png"];

  if (!req.file) {
    throw new HttpBadRequest("Please select a file to upload");
  }

  const fileExtension = req.file?.originalname.split(".").pop()?.toLowerCase();

  if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
    throw new HttpBadRequest("Unsupported File Format");
  }
};

export const validateAddHrProfileInput = (req: Request): void => {
  if (!req.body.email_id) {
    throw new HttpBadRequest("Email ID is required");
  }
};

export const validateUpdateHrProfileInput = (req: Request): void => {
  if (!req.body.id) {
    throw new HttpBadRequest("Profile Id is required");
  }
  if (req.body.hasOwnProperty("user_id") && !req.body.user_id) {
    throw new HttpBadRequest("User Id is required");
  }
  if (req.body.hasOwnProperty("email_id") && !req.body.email_id) {
    throw new HttpBadRequest("Email ID is required");
  }
};
