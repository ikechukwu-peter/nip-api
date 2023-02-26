import { urlLogger } from "./../logger";
import { Request, Response } from "express";
import dayjs from "dayjs";
import * as bcrypt from "bcrypt";
import { IUrl, UrlModel } from "../models";
import { CONSTANTS } from "../config";
import { generateShortUrl, generateQR } from "./../utils";
import { IStatsDTO } from "./dto";

export const createUrlUnsign = async (
  req: Request,
  res: Response
): Promise<IUrl | unknown | void> => {
  let { originalUrl } = req.body;

  // await UrlModel.deleteMany({});

  //check if original url startswith ${req.protocol}
  if (!originalUrl.startsWith("http")) {
    originalUrl = `${req.protocol}://${originalUrl}`;
  }

  //formulate document
  const newUrl = await UrlModel.create({
    originalUrl,
    shortUrl: generateShortUrl(),
    expiresAt: dayjs().add(30, "days"),
  });

  //save to db
  newUrl.save();

  return res.status(201).json({
    message: "URL shortened successfully",
    resource: {
      url: `${req.protocol}://${req.headers.host}/${newUrl?.shortUrl}`,
    },
  });
};

export const createUrl = async (
  req: Request,
  res: Response
): Promise<IUrl | unknown | void> => {
  let { originalUrl } = req.body;
  let isCustomUrl = false;
  let notCustomUrl = !isCustomUrl;
  let isPasswordEnabled = false;
  let isExpiresAt = false;

  //check if there is a custom url
  if (req.body?.customUrl) {
    isCustomUrl = true;
    notCustomUrl = !isCustomUrl;
  }

  //check if there is a password
  if (req.body?.password) {
    isPasswordEnabled = true;
  }

  //check if there is expiresAt
  if (req.body?.expiresAt) {
    const isPast = dayjs(req.body?.expiresAt).isBefore(
      dayjs().subtract(1, "day")
    );
    if (isPast) {
      return res.status(400).json({ error: "Expires At is in the past" });
    }
    isExpiresAt = true;
  }

  //user from request
  const user = req.user;

  //check if original url startswith ${req.protocol}
  if (!originalUrl.startsWith("http")) {
    originalUrl = `${req.protocol}://${originalUrl}`;
  }

  //check for duplicate custom url
  if (isCustomUrl) {
    const customUrlExist = await UrlModel.findOne({
      customUrl: req.body?.customUrl,
    });

    if (customUrlExist) {
      urlLogger.error(`Custom url ${req.body?.customUrl} already exist`);
      return res
        .status(422)
        .json({ error: `Custom url ${req.body?.customUrl} already exist` });
    }
  }

  const shortUrl = generateShortUrl();

  urlLogger.info(shortUrl, "SHORT URL");

  //formulate document
  const newUrl = await UrlModel.create({
    user,
    originalUrl,
    ...(isCustomUrl && { customUrl: req.body?.customUrl }),
    ...(notCustomUrl && { shortUrl: shortUrl }),
    qr: isCustomUrl
      ? await generateQR(
          `${req.protocol}://${req.headers.host}/${req.body?.customUrl}`
        )
      : await generateQR(`${req.protocol}://${req.headers.host}/${shortUrl}`),
    expiresAt: isExpiresAt
      ? dayjs(req.body?.expiresAt)
      : dayjs().add(30, "days"),
    ...(isPasswordEnabled && {
      password: await bcrypt.hash(req.body?.password, CONSTANTS.SALT),
    }),
    ...(isPasswordEnabled && {
      isPasswordEnabled: isPasswordEnabled,
    }),
  });

  //save to db
  newUrl.save();

  const url = isCustomUrl
    ? `${req.protocol}://${req.headers.host}/${newUrl.customUrl}`
    : `${req.protocol}://${req.headers.host}/${shortUrl}`;

  res.status(201).json({
    message: "URL shortened successfully",
    resource: { url, qr: newUrl.qr },
  });
};

export const getUrl = async (
  req: Request,
  res: Response
): Promise<IUrl | unknown | void> => {
  const { url } = req.params;

  const urlData = await UrlModel.findOne({
    $or: [{ shortUrl: url }, { customUrl: url }],
    expiresAt: { $gt: Date.now() },
  }).select("-password");

  if (!urlData) {
    urlLogger.error(`${url} is invalid or has expired`);
    return res.status(404).json({ error: `${url} is invalid or has expired` });
  }

  if (urlData?.isPasswordEnabled) {
    //this is the url to a page that will ask for password
    return res.redirect(`${process.env.CLIENT_URL}/verify/${url}`);
  }

  res.redirect(urlData.originalUrl);
  return urlData.updateOne({ totalClicks: urlData.totalClicks + 1 });
};

export const getUrlWithPassword = async (
  req: Request,
  res: Response
): Promise<IUrl | unknown | void> => {
  const { url, password } = req.params;

  const urlData = await UrlModel.findOne({
    __v: 0,
    $or: [{ shortUrl: url }, { customUrl: url }],
  });

  if (!urlData) {
    urlLogger.error(
      `${req.protocol}://${req.headers.host}/${url} is invalid or has expired`
    );
    return res.status(404).json({
      error: `${req.protocol}://${req.headers.host}/${url} is invalid or has expired`,
    });
  }

  //check if password matches
  if (!(await bcrypt.compare(password, urlData?.password as string))) {
    urlLogger.error(`${url} is invalid or has expired`);
    return res.status(404).json({ error: `${url} is invalid or has expired` });
  }
  res.status(200).json({ resource: urlData.originalUrl });

  return urlData.updateOne({ totalClicks: urlData.totalClicks + 1 });
};

export const getUrls = async (
  req: Request,
  res: Response
): Promise<IUrl[] | unknown | void> => {
  const urlData = await UrlModel.find({
    user: req.user,
    expiresAt: { $gt: Date.now() },
  })
    .select("-password")
    .sort({ totalClicks: -1 });

  const response = urlData.map((url) => {
    return {
      url: url.customUrl
        ? `${req.protocol}://${req.headers.host}/${url.customUrl}`
        : `${req.protocol}://${req.headers.host}/${url.shortUrl}`,
      clicks: url.totalClicks,
      id: url._id,
      createdAt: url.createdAt,
    };
  });

  return res.status(200).json({ resource: response });
};

export const getAUrl = async (
  req: Request,
  res: Response
): Promise<IUrl | unknown | void> => {
  const { id } = req.params;

  const urlData = await UrlModel.findOne({
    user: req.user,
    _id: id,
  }).select("-password");

  if (!urlData) {
    urlLogger.error(`${id} is invalid or has expired`);
    return res.status(404).json({ error: `${id} is invalid or has expired` });
  }

  const response = {
    shortUrl: urlData.customUrl
      ? `${req.protocol}://${req.headers.host}/${urlData.customUrl}`
      : `${req.protocol}://${req.headers.host}/${urlData.shortUrl}`,
    clicks: urlData.totalClicks,
    id: urlData._id,
    createdAt: urlData.createdAt,
    expiresAt: urlData.expiresAt,
    qr: urlData.qr,
    isPasswordEnabled: urlData.isPasswordEnabled,
  };

  return res.status(200).json({ resource: response });
};

export const stats = async (
  req: Request,
  res: Response
): Promise<IStatsDTO | unknown | void> => {
  const urlData = await UrlModel.find({
    user: req.user,
    expiresAt: { $gt: Date.now() },
  })
    .select("-password")
    .sort({ totalClicks: -1 });

  if (!urlData?.length) {
    const result = {
      totalClicks: 0,
      highestClicked: "nil",
      lowestClicked: "nil",
    };

    return res.status(200).json({
      resource: {
        urls: [],
        ...result,
      },
    });
  }

  const result = {
    totalClicks: urlData.reduce((acc, curr: IUrl) => acc + curr.totalClicks, 0),
    highestClicked: urlData[0].customUrl
      ? `${req.protocol}://${req.headers.host}/${urlData[0].customUrl}`
      : `${req.protocol}://${req.headers.host}/${urlData[0].shortUrl}`,
    highestClicks: urlData[0].totalClicks,
    lowestClicked: urlData[urlData.length - 1].customUrl
      ? `${req.headers.host}/${urlData[urlData.length - 1].customUrl}`
      : `${req.headers.host}/${urlData[urlData.length - 1].shortUrl}`,
    lowestClicks: urlData[urlData.length - 1].totalClicks,
  };

  return res.status(200).json({
    resource: {
      urls: urlData.map((item) => {
        const res = {
          urls: item.customUrl
            ? `${req.protocol}://${req.headers.host}/${item.customUrl}`
            : `${req.protocol}://${req.headers.host}/${item.shortUrl}`,
          clicks: item.totalClicks,
        };
        return res;
      }),
      ...result,
    },
  });
};
