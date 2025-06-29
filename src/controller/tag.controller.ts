import { type Request, type Response } from "express";
import { PrismaClient } from "../generated/prisma";

let client = new PrismaClient();

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
