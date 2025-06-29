import { type Request, type Response } from "express";
import { PrismaClient } from "../generated/prisma";
let client = new PrismaClient();

export async function createSettings(req: Request, res: Response) {
  try {
    let { key, value, group_name } = req.body;
    if (!key || !value || !group_name) {
      res.status(400).json({
        msg: "Input fields cannot be left empty",
      });
      return;
    }

    let settingsExits = await client.settings.findFirst({
      where: {
        key,
      },
    });

    if (settingsExits) {
      res.status(409).json({
        msg: "Setting with this key already exists, Try editing or deleting the existing setting",
      });
      return;
    }

    await client.settings.create({
      data: {
        key,
        value,
        group_name,
      },
    });

    res.status(200).json({
      msg: "Settings created successfully",
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

export async function editSetting(req: Request, res: Response) {
  try {
    let settingsId = Number(req.params.settingsId);
    if (!settingsId) {
      res.status(400).json({
        msg: "Settings id not present in the params",
      });
      return;
    }

    let key = req.body?.key;
    let value = req.body?.value;
    let group_name = req.body?.group_name;

    let settingsExists = await client.settings.findFirst({
      where: {
        id: settingsId,
      },
    });

    if (!settingsExists) {
      res.status(404).json({
        msg: "No setting with such id found",
      });
      return;
    }

    let fieldsToUpdate: Record<string, any> = {};

    if (key) fieldsToUpdate.key = key;
    if (value) fieldsToUpdate.value = value;
    if (group_name) fieldsToUpdate.group_name = group_name;

    if (Object.keys(fieldsToUpdate).length === 0) {
      res.status(400).json({
        msg: "No any changes detected to update",
      });
      return;
    }

    await client.settings.update({
      where: {
        id: settingsId,
      },
      data: fieldsToUpdate,
    });

    res.status(200).json({
      msg: "Settings updated successfully",
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

export async function deleteSetting(req: Request, res: Response) {
  try {
    let settingsId = Number(req.params.settingsId);
    if (!settingsId) {
      res.status(400).json({
        msg: "No settings id found in params",
      });
      return;
    }

    let settingsExist = await client.settings.findFirst({
      where: {
        id: settingsId,
      },
    });

    if (!settingsExist) {
      res.status(404).json({
        msg: "No settings found with such id",
      });
      return;
    }

    await client.settings.delete({
      where: {
        id: settingsId,
      },
    });

    res.status(200).json({
      msg: "Settings deleted successfully",
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

export async function getSettings(req: Request, res: Response) {
  try {
    let settings = await client.settings.findMany({});

    if (!settings) {
      res.status(404).json({
        msg: "No settings found in db",
      });
      return;
    }

    res.status(200).json({
      settings,
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
