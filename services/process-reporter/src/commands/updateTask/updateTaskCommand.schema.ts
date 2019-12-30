export const updateTaskCommandSchema = {
  "definitions": {},
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "http://example.com/root.json",
  "type": "object",
  "title": "The Root Schema",
  "required": [
    "commandType",
    "id",
    "status",
    "failureReason",
    "updatedTimestamp"
  ],
  "properties": {
    "commandType": {
      "$id": "#/properties/commandType",
      "const": "update-task",
      "title": "The Command Type Schema",
    },
    "id": {
      "$id": "#/properties/id",
      "type": "string",
      "title": "The Id Schema",
      "default": "",
      "examples": [
        "test-id"
      ],
      "pattern": "^(.*)$"
    },
    "status": {
      "$id": "#/properties/status",
      "title": "The Status Schema",
      "items": {
        "type": "string",
        "enum": [
          "PENDING",
          "SUCCESS",
          "FAILURE"
        ]
      },
    },
    "failureReason": {
      "$id": "#/properties/failureReason",
      "type": "string",
      "title": "The Failure Reason Schema",
      "default": "",
      "pattern": "^(.*)$"
    },
    "updatedTimestamp": {
      "$id": "#/properties/updatedTimestamp",
      "type": "integer",
      "title": "The Timestamp Schema",
      "default": 0,
      "examples": [
        123
      ]
    }
  }
};
