import vine from "@vinejs/vine";

export const createUserSchema = vine.object({
  name: vine.string().trim().minLength(1),
  email: vine.string().trim().email(),
  password: vine.string().minLength(8),
  avatar: vine.string().optional(),
  status: vine.enum(["ACTIVE", "SUSPENDED"] as const),
});
