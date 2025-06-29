import { type Request, type Response } from "express";
import { PrismaClient } from "../generated/prisma";
import fs from "fs";

let client = new PrismaClient();

function deleteUplaodedFile(filePath: string) {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.log("Failed to delete the image", err);
    } else {
      console.log("Deleted unused image", filePath);
    }
  });
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
