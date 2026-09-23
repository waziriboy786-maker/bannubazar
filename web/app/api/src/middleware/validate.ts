import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";

// Wrap a Zod schema around { body, query, params } and reject early.
export function validate(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.parse({ body: req.body, query: req.query, params: req.params });
    req.body = parsed.body ?? req.body;
    next();
  };
}
