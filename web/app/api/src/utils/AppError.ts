export class AppError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const Errors = {
  notFound: (what = "Resource") => new AppError(404, "NOT_FOUND", `${what} not found.`),
  unauthorized: (msg = "Authentication required.") => new AppError(401, "UNAUTHORIZED", msg),
  forbidden: (msg = "You do not have permission to perform this action.") =>
    new AppError(403, "FORBIDDEN", msg),
  badRequest: (msg: string, code = "BAD_REQUEST") => new AppError(400, code, msg),
  conflict: (msg: string, code = "CONFLICT") => new AppError(409, code, msg),
};
