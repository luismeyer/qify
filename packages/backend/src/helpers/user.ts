import { Request } from "express";

import { FrontendUser, User } from "@qify/api";

import { getItem, queryItems, sessionIndex, updateItem } from "../services/db";
import { callSpotify, spotify } from "../services/spotify";

export const updateTokens = async (
  id: string,
  accessToken: string,
  refreshToken?: string
) => {
  const expressionAttributeNames = {
    "#accessToken": "accessToken",
    ...(refreshToken && { "#refreshToken": "refreshToken" }),
  };

  const expressionAttributeValues = {
    ":accessToken": accessToken,
    ...(refreshToken && { ":refreshToken": refreshToken }),
  };

  const updateExpression = `SET #accessToken = :accessToken ${
    refreshToken ? ", #refreshToken = :refreshToken" : ""
  }`;

  await updateItem(id, {
    expressionAttributeNames,
    expressionAttributeValues,
    updateExpression,
  });
};

export const sessionUsers = async (session: string) => {
  return await queryItems<User>(sessionIndex, {
    expressionAttributeNames: { "#session": "session" },
    expressionAttributeValues: { ":session": session },
    keyConditionExpression: "#session = :session",
  });
};

export const authorizeRequest = async (
  headers: Request["headers"]
): Promise<User | undefined> => {
  const { authorization } = headers;

  if (!authorization) {
    return;
  }

  const [_, token] = authorization.split(" ");

  return getItem(token);
};

export const transformUsers = async (
  users: User[]
): Promise<FrontendUser[]> => {
  const completeUsers = await Promise.all(
    users.map(async (sessionUser) => ({
      ...sessionUser,
      ...(await callSpotify(sessionUser, () => spotify.getMe())),
    }))
  );

  return completeUsers.map((cUser) => ({
    name: cUser.body.display_name ?? cUser.body.id,
    image: cUser.body.images?.[0].url,
    isOwner: cUser.isOwner,
    isPlayer: cUser.isPlayer,
    tracksInQueue: cUser.queue.length,
  }));
};
