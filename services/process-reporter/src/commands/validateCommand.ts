import AJV from "ajv";
import { Logger } from "../../handler";

const errorMessage = "Command is invalid";

export const validateCommand = (command: any, schema: object, logger: Logger) => {
  const ajv = new AJV({ allErrors: true });
  if (!ajv.validate(schema, command)) {
    logger.error(errorMessage, ajv.errors);
    throw new Error(errorMessage);
  }
};
