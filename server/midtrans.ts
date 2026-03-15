import midtransClient from "midtrans-client";
import crypto from "crypto";

import { storage } from "./storage";

async function getMidtransConfig() {
  const page = await storage.getCmsPage("settings-midtrans");
  if (page) {
    try {
      const config = JSON.parse(page.content);
      return {
        isProduction: config.mode === "production",
        serverKey: config.serverKey || process.env.MIDTRANS_SERVER_KEY || "",
        clientKey: config.clientKey || process.env.MIDTRANS_CLIENT_KEY || "",
      };
    } catch (e) {
      console.error("Failed to parse settings-midtrans", e);
    }
  }
  return {
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
    serverKey: process.env.MIDTRANS_SERVER_KEY || "",
    clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
  };
}

export async function createSnapTransaction(params: {
  orderId: string;
  grossAmount: number;
  donorName: string;
  donorEmail?: string;
  programTitle: string;
}) {
  const config = await getMidtransConfig();
  const snapInstance = new midtransClient.Snap(config);

  const parameter = {
    transaction_details: {
      order_id: params.orderId,
      gross_amount: params.grossAmount,
    },
    item_details: [
      {
        id: "donation",
        price: params.grossAmount,
        quantity: 1,
        name: `Donasi: ${params.programTitle}`.substring(0, 50),
      },
    ],
    customer_details: {
      first_name: params.donorName,
      email: params.donorEmail || undefined,
    },
  };

  const transaction = await snapInstance.createTransaction(parameter);
  return {
    token: transaction.token,
    redirect_url: transaction.redirect_url,
  };
}

export async function getClientKey() {
  const config = await getMidtransConfig();
  return config.clientKey;
}

export async function verifySignatureKey(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string
): Promise<boolean> {
  const config = await getMidtransConfig();
  const serverKey = config.serverKey;
  const payload = orderId + statusCode + grossAmount + serverKey;
  const expectedSignature = crypto.createHash("sha512").update(payload).digest("hex");
  return expectedSignature === signatureKey;
}

export async function getTransactionStatus(orderId: string) {
  const config = await getMidtransConfig();
  const core = new midtransClient.CoreApi(config);
  return await core.transaction.status(orderId);
}
