import AJV from "ajv";
import { Logger } from "../../handler";

export const validateCommand = (command: any, schema: object, logger: Logger) => {
  const ajv = new AJV({ allErrors: true });
  if (!ajv.validate(schema, command)) {
    logger.error("Create Process Command is invalid", ajv.errors);
    throw new Error("Create Process Command is invalid");
  }
};
