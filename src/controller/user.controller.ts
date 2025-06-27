import { type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { createUserSchema } from "../validators/createUser";
import vine from "@vinejs/vine";
import { PrismaClient } from "../generated/prisma";
import dotenv from "dotenv";
import fs from "fs";
import { createCategorySchema } from "../validators/createCategory";

dotenv.config();

const client = new PrismaClient();

export async function userSignup(req: Request, res: Response) {
  try {
    let defaultRole = await client.roles.findFirst({
      where: {
        name: "BASIC",
      },
    });

    if (!defaultRole) {
      res.status(404).json({
        msg: "No roles found in database",
      });
      return;
    }

    const payload = await vine.validate({
      schema: createUserSchema,
      data: req.body,
    });

    let { name, email, password, avatar, status } = payload;

    let existingUser = await client.users.findFirst({
      where: {
        email,
      },
    });

    if (existingUser) {
      res.status(409).json({
        msg: "User already exists with that email",
      });
      return;
    }

    let hashedPassword = await bcrypt.hash(password, 10);

    await client.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        avatar,
        status,
        UserRoles: {
          create: [
            {
              role_id: defaultRole.id,
            },
          ],
        },
      },
    });

    res.status(200).json({
      msg: "User created successfully",
    });
  } catch (error) {
    res.status(500).json({
      msg:
        error instanceof Error
          ? error.message
          : "Something went wrong in the server",
    });
  }
}

export async function userLogin(req: Request, res: Response) {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        msg: "Input fields cannot be left empty",
      });
      return;
    }

    let existingUser = await client.users.findFirst({
      where: {
        email,
      },
    });

    if (!existingUser) {
      res.status(404).json({
        msg: "No such user found in our db",
      });
      return;
    }

    let passwordMatch = await bcrypt.compare(password, existingUser.password);

    if (!passwordMatch) {
      res.status(409).json({
        msg: "Incorrect credentials, Please try again later",
      });
      return;
    }

    let token = await jwt.sign({ email }, process.env.JWT_SECRET!);

    res.status(200).json({
      token,
    });
  } catch (error) {
    res.status(500).json({
      msg:
        error instanceof Error
          ? error.message
          : "Something went wrong with the server",
    });
  }
}

export async function userDetails(req: Request, res: Response) {
  try {
    // @ts-ignore
    let user = req?.user;
    let currentUser = await client.users.findFirst({
      where: {
        email: user,
      },
    });

    let userId = currentUser?.id;

    let userDetails = await client.users.findFirst({
      where: {
        id: userId,
      },
    });

    res.status(200).json({
      userDetails,
    });
  } catch (error) {
    res.status(500).json({
      msg:
        error instanceof Error
          ? error.message
          : "Something went wrong with the server",
    });
  }
}

export async function editUserDetails(req: Request, res: Response) {
  try {
    let userId = Number(req.params.userId);

    if (!userId) {
      res.status(404).json({
        msg: "No user id in params",
      });
      return;
    }

    let name = req.body?.name;
    let email = req.body?.email;
    let password = req.body?.password;
    const file = (req as Request & { file?: Express.Multer.File }).file;
    let avatar = file ? `/uploads/${file.filename}` : null;

    let fieldsToUpdate: Record<string, any> = {};

    if (name) fieldsToUpdate.name = name;
    if (email) fieldsToUpdate.email = email;
    if (password) {
      let hashedPassword = await bcrypt.hash(password, 10);
      fieldsToUpdate.password = hashedPassword;
    }
    if (avatar) fieldsToUpdate.avatar = avatar;

    if (Object.keys(fieldsToUpdate).length === 0) {
      res.status(400).json({
        msg: "No changes detected to update",
      });
      return;
    }

    await client.users.update({
      where: {
        id: userId,
      },
      data: fieldsToUpdate,
    });

    res.status(200).json({
      msg: "User updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      msg:
        error instanceof Error
          ? error.message
          : "Something went wrong with the server",
    });
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    let userId = Number(req.params.userId);
    if (!userId) {
      res.status(400).json({
        msg: "No user id found in params",
      });
      return;
    }

    await client.users.delete({
      where: {
        id: userId,
      },
    });

    res.status(200).json({
      msg: "The user has been deleted",
    });
  } catch (error) {
    res.status(500).json({
      msg:
        error instanceof Error
          ? error.message
          : "Something went wrong with the server",
    });
  }
}

export async function viewRole(req: Request, res: Response) {
  try {
    let roles = await client.roles.findMany({});
    if (roles.length === 0) {
      res.status(404).json({
        msg: "There are currently no roles at the moment, Consider creating some roles",
      });
      return;
    }

    res.status(200).json({
      roles,
    });
  } catch (error) {
    res.status(500).json({
      msg:
        error instanceof Error
          ? error.message
          : "Something went wrong with the server",
    });
  }
}

export async function viewAllUsers(req: Request, res: Response) {
  try {
    let users = await client.users.findMany({
      include: {
        UserRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (users.length === 0) {
      res.status(404).json({
        msg: "There are currently no users in our db",
      });
      return;
    }

    res.status(200).json({
      users,
    });
  } catch (error) {
    res.status(500).json({
      msg:
        error instanceof Error
          ? error.message
          : "Something went wrong with the server",
    });
  }
}

// export async function assignRole(req: Request, res: Response) {
//   try {
//     let userId = Number(req.params.userId);

//     let userDetails = await client.users.findFirst({
//       where: {
//         id: userId,
//       },
//       include: {
//         UserRoles: {
//           include: {
//             role: true,
//           },
//         },
//       },
//     });

//     let isUser = userDetails?.UserRoles.some((ur) => ur.role.name === "BASIC");
//     console.log("🚀 ~ assignRole ~ isUser:", isUser)

//     if (!isUser) {
//       res.status(409).json({
//         msg: "The user is admin",
//       });
//     }

//   } catch (error) {
//     res.status(500).json({
//       msg:
//         error instanceof Error
//           ? error.message
//           : "Something went wrong with the server",
//     });
//   }
// }

export async function addCategory(req: Request, res: Response) {
  try {
    const payload = await vine.validate({
      schema: createCategorySchema,
      data: req.body,
    });

    let { name, description, parent_id } = payload;

    let existingCategory = await client.categories.findFirst({
      where: {
        name,
      },
    });

    if (existingCategory) {
      res.status(409).json({
        msg: "Similar category already exists try nesting the category in it",
      });
      return;
    }

    await client.categories.create({
      data: {
        name,
        description,
        parent_id,
      },
    });

    res.status(200).json({
      msg: "Categories created successfully",
    });
  } catch (error) {
    res.status(500).json({
      msg:
        error instanceof Error
          ? error.message
          : "Something went wrong with the server",
    });
  }
}

export async function fetchCategory(req: Request, res: Response) {
  try {
    let categories = await client.categories.findMany({});

    if (categories.length === 0) {
      res.status(404).json({
        msg: "No any categories listed in our db",
      });
      return;
    }

    res.status(200).json({
      categories,
    });
  } catch (error) {
    res.status(500).json({
      msg:
        error instanceof Error
          ? error.message
          : "Something went wrong with the server",
    });
  }
}

export async function deleteCategory(req: Request, res: Response) {
  try {
    let categoryId = Number(req.params.categoryId);

    if (!categoryId) {
      res.status(400).json({
        msg: "No category id present in the params",
      });
      return;
    }

    let categoryExists = await client.categories.findFirst({
      where: {
        id: categoryId,
      },
    });

    if (!categoryExists) {
      res.status(404).json({
        msg: "No any category with such id present in the db",
      });
      return;
    }

    await client.categories.delete({
      where: {
        id: categoryId,
      },
    });

    res.status(200).json({
      msg: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      msg:
        error instanceof Error
          ? error.message
          : "Something went wrong with the server",
    });
  }
}

export async function updateCategory(req: Request, res: Response) {
  try {
    let categoryId = Number(req.params.categoryId);
    if (!categoryId) {
      res.status(400).json({
        msg: "No category id present in the params",
      });
      return;
    }

    let name = req.body?.name;
    let description = req.body?.description;
    let parent_id = req.body?.parent_id;

    let fieldsToUpdate: Record<string, any> = {};

    if (name) fieldsToUpdate.name = name;
    if (description) fieldsToUpdate.description = description;
    if (parent_id) fieldsToUpdate.parent_id = parent_id;

    let categoryExists = await client.categories.findFirst({
      where: {
        id: categoryId,
      },
    });

    if (!categoryExists) {
      res.status(404).json({
        msg: "No category with such id found in the db",
      });
      return;
    }

    await client.categories.update({
      where: {
        id: categoryId,
      },
      data: fieldsToUpdate,
    });
    res.status(200).json({
      msg: "Cateogry updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      msg:
        error instanceof Error
          ? error.message
          : "Something went wrong with the server",
    });
  }
}
