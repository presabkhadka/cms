import { type Request, type Response } from "express";
import { PrismaClient } from "../generated/prisma";
let client = new PrismaClient();
import vine from "@vinejs/vine";
import { createCategorySchema } from "../validators/createCategory";

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
