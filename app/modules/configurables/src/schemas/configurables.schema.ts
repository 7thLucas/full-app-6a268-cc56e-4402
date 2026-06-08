/* START: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */
export interface FieldSchemaType {
  fieldName?: string;
  type:
    | "string"
    | "number"
    | "boolean"
    | "object"
    | "array"
    | "color"
    | "url"
    | "enum"
    | "datetime"
    | "file"
    | "files";
  required?: boolean;
  label?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: string[];
  fields?: FieldSchemaType[];
  item?: FieldSchemaType;
}
/* END: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */

export type ConfigurableSchemas = {
  formSchema: FieldSchemaType[];
};



export const configurableSchemas: ConfigurableSchemas = {
  formSchema: [
    {
      fieldName: "appName",
      type: "string",
      required: true,
      label: "App Name",
    },
    {
      fieldName: "logoUrl",
      type: "url",
      required: true,
      label: "Logo URL",
    },
    {
      fieldName: "brandColor",
      type: "object",
      required: true,
      label: "Brand Color",
      fields: [
        {
          fieldName: "primary",
          type: "color",
          required: true,
          label: "Primary",
        },
        {
          fieldName: "secondary",
          type: "color",
          required: true,
          label: "Secondary",
        },
        {
          fieldName: "accent",
          type: "color",
          required: true,
          label: "Accent",
        },
      ],
    },
    {
      fieldName: "tagline",
      type: "string",
      required: false,
      label: "Tagline",
      maxLength: 120,
    },
    {
      fieldName: "uploadHeadline",
      type: "string",
      required: false,
      label: "Upload Zone Headline",
      maxLength: 80,
    },
    {
      fieldName: "uploadSubtext",
      type: "string",
      required: false,
      label: "Upload Zone Subtext",
      maxLength: 120,
    },
    {
      fieldName: "historyPageSize",
      type: "number",
      required: false,
      label: "History Items Per Page",
      min: 5,
      max: 50,
    },
    {
      fieldName: "showTranscript",
      type: "boolean",
      required: false,
      label: "Show Transcript Section",
    },
    {
      fieldName: "showMedia",
      type: "boolean",
      required: false,
      label: "Show Media Player Section",
    },
    {
      fieldName: "showLogs",
      type: "boolean",
      required: false,
      label: "Show Processing Logs",
    },
  ],
};
