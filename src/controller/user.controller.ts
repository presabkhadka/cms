import { type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { createUserSchema } from "../validators/createUser";
import vine from "@vinejs/vine";
import { PrismaClient } from "../generated/prisma";
import dotenv from "dotenv";
import fs, { stat } from "fs";
import path from "path";
import { createCategorySchema } from "../validators/createCategory";

dotenv.config();

const client = new PrismaClient();

function deleteUplaodedFile(filePath: string) {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.log("Failed to delete the image", err);
    } else {
      console.log("Deleted unused image", filePath);
    }
  });
}

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

export async function createTag(req: Request, res: Response) {
  try {
    let { name, slug } = req.body;

    if (!name || !slug) {
      res.status(400).json({
        msg: "Input fields cannot be left empty",
      });
      return;
    }

    let existingTag = await client.tags.findFirst({
      where: {
        name,
      },
    });

    if (existingTag) {
      res.status(409).json({
        msg: "A tag with same name already exists try using it",
      });
      return;
    }

    await client.tags.create({
      data: {
        name,
        slug,
      },
    });
    res.status(200).json({
      msg: "Tag created successfully",
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

export async function fetchTag(req: Request, res: Response) {
  try {
    let tags = await client.tags.findMany({});

    if (tags.length === 0) {
      res.status(404).json({
        msg: "There are no any tags in our db, Try creating one",
      });
      return;
    }

    res.status(200).json({
      tags,
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

export async function deleteTag(req: Request, res: Response) {
  try {
    let tagId = Number(req.params.tagId);
    if (!tagId) {
      res.status(400).json({
        msg: "No tag id present in the params",
      });
      return;
    }

    let existingTagId = await client.tags.findFirst({
      where: {
        id: tagId,
      },
    });

    if (!existingTagId) {
      res.status(404).json({
        msg: "No any tag with such id found in the db",
      });
      return;
    }

    await client.tags.delete({
      where: {
        id: tagId,
      },
    });

    res.status(200).json({
      msg: "Tag deleted successfully",
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

export async function updateTag(req: Request, res: Response) {
  try {
    let tagId = Number(req.params.tagId);
    if (!tagId) {
      res.status(400).json({
        msg: "No tag id found in the params",
      });
      return;
    }

    let name = req.body?.name;
    let slug = req.body?.slug;

    let existingTag = await client.tags.findFirst({
      where: {
        id: tagId,
      },
    });

    if (!existingTag) {
      res.status(404).json({
        msg: "No any tag with such id found in the db",
      });
      return;
    }

    let fieldsToUpdate: Record<string, any> = {};

    if (name) fieldsToUpdate.name = name;
    if (slug) fieldsToUpdate.slug = slug;

    if (Object.keys(fieldsToUpdate).length === 0) {
      res.status(400).json({
        msg: "No new changes detected to update",
      });
      return;
    }

    await client.tags.update({
      where: {
        id: tagId,
      },
      data: fieldsToUpdate,
    });

    res.status(200).json({
      msg: "Tag updated succssfully",
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

export async function fetchContent(req: Request, res: Response) {
  try {
    let content = await client.content.findMany({});

    if (content.length === 0) {
      res.status(404).json({
        msg: "No content found in db, Try adding some",
      });
      return;
    }

    res.status(200).json({
      content,
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

export async function fetchContentBySlug(req: Request, res: Response) {
  try {
    let { slug } = req.params;
    if (!slug) {
      res.status(400).json({
        msg: "No slug found in the parameters",
      });
      return;
    }

    let content = await client.content.findFirst({
      where: {
        slug,
      },
    });

    if (!content) {
      res.status(404).json({
        msg: "No any content found with such slug",
      });
      return;
    }

    res.status(200).json({
      content,
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

export async function createContent(req: Request, res: Response) {
  try {
    let { title, slug, body, status } = req.body;
    let category_id = Number(req.body.category_id);

    let image = req.file ? `/uploads/${req.file.filename}` : "";

    if (!title || !slug || !body || !category_id || !status) {
      if (req.file) deleteUplaodedFile(req.file.path);
      res.status(400).json({
        msg: "Input fields cannot be left empty",
      });
      return;
    }

    if (!image) {
      if (req.file) deleteUplaodedFile(req.file.path);
      res.status(400).json({
        msg: "Image is required",
      });
      return;
    }

    let categoryExists = await client.categories.findFirst({
      where: {
        id: Number(category_id),
      },
    });

    if (!categoryExists) {
      if (req.file) deleteUplaodedFile(req.file.path);

      res.status(404).json({
        msg: "No category with such id found in our db",
      });
      return;
    }

    // @ts-ignore
    let user = req.user;

    let userRecord = await client.users.findFirst({
      where: {
        email: user,
      },
      select: {
        id: true,
      },
    });

    if (!userRecord) {
      if (req.file) deleteUplaodedFile(req.file.path);

      res.status(404).json({
        msg: "User not found",
      });
      return;
    }

    let userId = userRecord.id;

    let finalSlug = slug.replace(/ /g, "-");

    let existingContent = await client.content.findFirst({
      where: {
        title,
      },
    });

    if (existingContent) {
      if (req.file) deleteUplaodedFile(req.file.path);

      res.status(409).json({
        msg: "A content exists with the same title, Try something different",
      });
      return;
    }

    await client.content.create({
      data: {
        title,
        slug: finalSlug,
        body,
        image,
        category_id,
        status,
        author_id: userId,
      },
    });

    res.status(200).json({
      msg: "Content created successfully",
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

export async function updateContent(req: Request, res: Response) {
  try {
    let contentId = Number(req.params.contentId);

    if (!contentId) {
      res.status(400).json({
        msg: "No content id found in params",
      });
      return;
    }

    let title = req.body?.title;
    let slug = req.body?.slug;
    let body = req.body?.body;
    let image = req.file ? `/uploads/${req.file.filename}` : "";
    let category_id = Number(req.body?.category_id);
    // @ts-ignore
    let user = req.user;
    let userRecords = await client.users.findFirst({
      where: {
        email: user,
      },
      select: {
        id: true,
      },
    });

    let userId = userRecords!.id;

    let fieldsToUpdate: Record<string, any> = {};

    if (title) fieldsToUpdate.title = title;
    if (slug) fieldsToUpdate.slug = slug;
    if (body) fieldsToUpdate.body = body;
    if (image) fieldsToUpdate.image = image;
    if (category_id) fieldsToUpdate.category_id = category_id;

    if (Object.keys(fieldsToUpdate).length === 0) {
      res.status(400).json({
        msg: "No any new changes found to update",
      });
      return;
    }

    let content = await client.content.findFirst({
      where: {
        id: contentId,
      },
    });

    if (content?.author_id !== userId) {
      res.status(400).json({
        msg: "You cannot update other author's content",
      });
      return;
    }

    await client.revisions.create({
      data: {
        content_id: contentId,
        title: content.title,
        body: content.body,
        author_id: userId,
      },
    });

    await client.content.update({
      where: {
        id: contentId,
        author_id: userId,
      },
      data: fieldsToUpdate,
    });

    res.status(200).json({
      msg: "Content updated successfully",
    });
    return;
  } catch (error) {
    res.status(500).json({
      msg:
        error instanceof Error
          ? error.message
          : "Something went wrong with the server",
    });
  }
}

export async function deleteContent(req: Request, res: Response) {
  try {
    let contentId = Number(req.params.contentId);
    // @ts-ignore
    let user = req.user;

    let currentUser = await client.users.findFirst({
      where: {
        email: user,
      },
      select: {
        id: true,
      },
    });

    let userId = currentUser!.id;

    if (!contentId) {
      res.status(400).json({
        msg: "No content id found in params",
      });
      return;
    }

    let contentExists = await client.content.findFirst({
      where: {
        id: contentId,
      },
    });

    if (!contentExists) {
      res.status(404).json({
        msg: "No content found with such id in our db",
      });
      return;
    }

    if (contentExists.author_id !== userId) {
      res.status(409).json({
        msg: "You can't delete other author's content",
      });
      return;
    }

    await client.content.delete({
      where: {
        id: contentId,
      },
    });

    res.status(200).json({
      msg: "Content deleted successfully",
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

export async function fetchAllRevision(req: Request, res: Response) {
  try {
    let contentId = Number(req.params.contentId);
    if (!contentId) {
      res.status(400).json({
        msg: "No content id provided in the params",
      });
      return;
    }

    let revisions = await client.revisions.findMany({
      where: {
        content_id: contentId,
      },
    });

    if (!revisions) {
      res.status(404).json({
        msg: "No any revision found, Try updating the content to create a revision of it",
      });
      return;
    }

    res.status(200).json({
      revisions,
    });
  } catch (error) {
    res.status(500).json({
      msg:
        error instanceof Error
          ? error.message
          : "Something went wrong witht the server",
    });
  }
}

export async function fetchSingleRevision(req: Request, res: Response) {
  try {
    let revisionId = Number(req.params.revisionId);
    if (!revisionId) {
      res.status(400).json({
        msg: "No revision id found in the params",
      });
      return;
    }

    let revisions = await client.revisions.findFirst({
      where: {
        id: revisionId,
      },
    });

    if (!revisions) {
      res.status(404).json({
        msg: "No revision found with that id",
      });
      return;
    }

    res.status(200).json({
      revisions,
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

export async function createComment(req: Request, res: Response) {
  try {
    let contentId = Number(req.params.contentId);
    if (!contentId) {
      res.status(400).json({
        msg: "No content id found in params",
      });
      return;
    }

    // @ts-ignore
    let user = req.user;

    let userDetails = await client.users.findFirst({
      where: {
        email: user,
      },
      select: {
        id: true,
      },
    });

    let userId = userDetails!.id;

    let comment = req.body.comment
    let status = req.body.status

    if (!comment || !status) {
      res.status(400).json({
        msg: "Input fields cannot be left empty",
      });
      return;
    }

    await client.comments.create({
      data: {
        content_id: contentId,
        user_id: userId,
        comment,
        status,
      },
    });

    res.status(200).json({
      msg: "Comment created",
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
