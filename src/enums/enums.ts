export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

export enum UserTypes {
  SAD = 1, // SUPER_ADMIN
  ADM = 2, // ADMIN
  HRU = 3, // HR_USER
  USR = 4, // USER
}

export enum AccountStatus {
  ACT = "Active",
  BLO = "Blocked",
  SUS = "Suspended",
}

export enum AccountStatusId {
  ACTIVE = 1,
  INACTIVE = 2,
  BLOCKED = 3,
  SUSPENDED = 4,
}

export enum ProfileStatus {
  DRAFT = 1,
  PREPARED = 2,
  VERIFIED = 3,
}
