import vine from "@vinejs/vine";

export const createContentSchema = vine.object({
  title: vine.string().trim().minLength(1),
  slug: vine.string().trim().minLength(1),
  body: vine.string().trim().minLength(1),
  image: vine.string(),
  category_id: vine.number(),
  status: vine.enum(["DRAFT", "PUBLISHED", "ARCHIVED"] as const),
  author_id: vine.number(),
});
