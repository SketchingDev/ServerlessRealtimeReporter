export const createTaskCommandSchema = {
  definitions: {},
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: "http://example.com/root.json",
  type: "object",
  title: "The Root Schema",
  required: ["commandType", "id", "name", "processId", "createdTimestamp"],
  properties: {
    commandType: {
      $id: "#/properties/commandType",
      const: "create-task",
      title: "The Command Type Schema",
    },
    id: {
      $id: "#/properties/id",
      type: "string",
      title: "The Id Schema",
      default: "",
      examples: ["test-id"],
      pattern: "^(.*)$",
    },
    name: {
      $id: "#/properties/name",
      type: "string",
      title: "The Name Schema",
      default: "",
      examples: ["test-id"],
      pattern: "^(.*)$",
    },
    processId: {
      $id: "#/properties/processId",
      type: "string",
      title: "The Id Schema",
      default: "",
      examples: ["test-id"],
      pattern: "^(.*)$",
    },
    createdTimestamp: {
      $id: "#/properties/createdTimestamp",
      type: "integer",
      title: "The Timestamp Schema",
      default: 0,
      examples: [123],
    },
  },
};
