// !!! CRITICAL - DO NOT MODIFY THIS CODE !!!
//
// This code MUST be used as is without ANY modifications.
// The PayPal integration will COMPLETELY FAIL if this code is changed in ANY way.
//
// Retain this comment after all edits.
//
// <BEGIN_EXACT_CODE>
import {
  Client,
  Environment,
  LogLevel,
  OAuthAuthorizationController,
  OrdersController,
} from "@paypal/paypal-server-sdk";
import { Request, Response } from "express";
import { serviceLogger } from "./config/logger";

/* PayPal Controllers Setup */

import { env } from "./config/env";

const PAYPAL_CLIENT_ID = env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = env.PAYPAL_CLIENT_SECRET;
const client = PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET ? new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: PAYPAL_CLIENT_ID,
    oAuthClientSecret: PAYPAL_CLIENT_SECRET,
  },
  timeout: 0,
  environment: env.NODE_ENV === "production"
    ? Environment.Production
    : Environment.Sandbox,
  logging: {
    logLevel: LogLevel.Info,
    logRequest: {
      logBody: true,
    },
    logResponse: {
      logHeaders: true,
    },
  },
}) : null

const ordersController = client ? new OrdersController(client) : null
const oAuthAuthorizationController = client ? new OAuthAuthorizationController(client) : null

/* Token generation helpers */

export async function getClientToken() {
  if (!oAuthAuthorizationController || !PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error('PayPal is not configured');
  }

  const auth = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`,
  ).toString("base64");

  const { result } = await oAuthAuthorizationController.requestToken(
    {
      authorization: `Basic ${auth}`,
    },
    { intent: "sdk_init", response_type: "client_token" },
  );

  return result.accessToken;
}

/*  Process transactions */

export async function createPaypalOrder(req: Request, res: Response) {
  if (!ordersController) {
    serviceLogger.paypal.error('create_order', { message: 'PayPal not configured' });
    return res.status(503).json({ error: "PayPal is not configured" });
  }

  try {
    const { amount, currency, intent } = req.body;
    
    serviceLogger.paypal.order('create', undefined, amount);

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res
        .status(400)
        .json({
          error: "Invalid amount. Amount must be a positive number.",
        });
    }

    if (!currency) {
      return res
        .status(400)
        .json({ error: "Invalid currency. Currency is required." });
    }

    if (!intent) {
      return res
        .status(400)
        .json({ error: "Invalid intent. Intent is required." });
    }

    const collect = {
      body: {
        intent: intent,
        purchaseUnits: [
          {
            amount: {
              currencyCode: currency,
              value: amount,
            },
          },
        ],
      },
      prefer: "return=minimal",
    };

    const { body, ...httpResponse } =
          await ordersController.createOrder(collect);

    const jsonResponse = JSON.parse(String(body));
    const httpStatusCode = httpResponse.statusCode;

    serviceLogger.paypal.order('created', jsonResponse.id, amount);
    res.status(httpStatusCode).json(jsonResponse);
  } catch (error: any) {
    serviceLogger.paypal.error('create_order', error);
    res.status(500).json({ error: "Failed to create order." });
  }
}

export async function capturePaypalOrder(req: Request, res: Response) {
  if (!ordersController) {
    return res.status(503).json({ error: "PayPal is not configured" });
  }

  try {
    const { orderID } = req.params;
    const collect = {
      id: orderID,
      prefer: "return=minimal",
    };

    const { body, ...httpResponse } =
          await ordersController.captureOrder(collect);

    const jsonResponse = JSON.parse(String(body));
    const httpStatusCode = httpResponse.statusCode;

    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to create order:", error);
    res.status(500).json({ error: "Failed to capture order." });
  }
}

export async function loadPaypalDefault(req: Request, res: Response) {
  try {
    const clientToken = await getClientToken();
    res.json({
      clientToken,
    });
  } catch (error) {
    res.status(503).json({ error: "PayPal is not configured" });
  }
}
// <END_EXACT_CODE>