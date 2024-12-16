import * as v from "valibot";

export const baseSchema = v.object({
  id: v.string(), // repository systemId or user systemId (user can't change this)
  displayId: v.string(), // repositoryName or userId (user can change this)
});
