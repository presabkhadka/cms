import vine from "@vinejs/vine";

export const createCategorySchema = vine.object({
  name: vine.string().trim().minLength(1),
  description: vine.string().minLength(1),
  parent_id: vine.number().optional(),
});
