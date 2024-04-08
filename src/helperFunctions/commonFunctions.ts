import { v4 as uuidv4 } from "uuid";
import fs from 'fs';
import fsExtra from "fs-extra";
import posix from "path/posix";
import path from "path";
import { HttpStatusCode } from "axios";

export function getPaginationData(queryParams: any) {
  const lastRecordKey = (
    queryParams.lastRecordKey
      ? parseInt(queryParams.lastRecordKey.toString())
      : 0
  ) as number | null;
  const perPage = queryParams.perPage
    ? parseInt(queryParams.perPage.toString())
    : undefined;

  return { lastRecordKey, perPage };
}

const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

export const destinationPath = function (req, file, cb) {
  const tenantId = req.body.id;
  const uploadPath = path.join(__dirname, '..', '..', process.env.AWS_SAVE_URL!);

  let destPath;
  switch (req.path) {
    case "/hrprofile/photoupload": {
      const uploadLocation = posix.join(process.env.AWS_PROFILE_PIC_PATH!, tenantId);
      destPath = path.join(uploadPath, uploadLocation);
      req.uploadUrl = posix.join(process.env.AWS_SAVE_URL!, uploadLocation, file.originalname);
      break;
    }
    case "/user/photoupload": {
      const uploadLocation = posix.join(process.env.AWS_USER_PROFILE_PIC_PATH!, tenantId);
      destPath = path.join(uploadPath, uploadLocation);
      req.uploadUrl = posix.join(process.env.AWS_SAVE_URL!, uploadLocation, file.originalname);
      break;
    }
    case "/tenant/logoupload": {
      const uploadLocation = posix.join(process.env.AWS_TENANT_LOGO_PATH!, tenantId);
      destPath = path.join(uploadPath, uploadLocation);
      req.uploadUrl = posix.join(process.env.AWS_SAVE_URL!, uploadLocation, file.originalname);
      break;
    }
    case "/hrprofile/resumeupload": {
      const uploadLocation = posix.join(process.env.AWS_RESUME_PATH!, tenantId);
      destPath = path.join(uploadPath, uploadLocation);
      req.uploadUrl = posix.join(process.env.AWS_SAVE_URL!, uploadLocation, file.originalname);
      break;
    }
    case "/hrprofile/docupload": {
      const docId = uuidv4();
      const uploadLocation = posix.join(process.env.AWS_DOC_PATH!, docId);
      destPath = path.join(uploadPath, uploadLocation);
      req.docId = docId;
      req.uploadUrl = posix.join(process.env.AWS_SAVE_URL!, uploadLocation, file.originalname);
      break;
    }
    default: {
    }
  }
  ensureDirExists(destPath);
  cb(null, destPath);
};

export async function deleteFile(filePath: string): Promise<any> {
  const directoryExists = await fsExtra.pathExists(filePath);
  if (!directoryExists) {
    return HttpStatusCode.NotFound;
  }

  // Delete the directory recursively
  await fsExtra.remove(filePath);
  return HttpStatusCode.Ok;
}
