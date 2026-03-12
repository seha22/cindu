import midtransClient from "midtrans-client";
import crypto from "crypto";

let snap: any = null;
let coreApi: any = null;

function isMidtransProduction() {
  return process.env.MIDTRANS_IS_PRODUCTION === "true";
}

function getSnap() {
  if (!snap) {
    snap = new midtransClient.Snap({
      isProduction: isMidtransProduction(),
      serverKey: process.env.MIDTRANS_SERVER_KEY || "",
      clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
    });
  }
  return snap;
}

function getCoreApi() {
  if (!coreApi) {
    coreApi = new midtransClient.CoreApi({
      isProduction: isMidtransProduction(),
      serverKey: process.env.MIDTRANS_SERVER_KEY || "",
      clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
    });
  }
  return coreApi;
}

export async function createSnapTransaction(params: {
  orderId: string;
  grossAmount: number;
  donorName: string;
  donorEmail?: string;
  programTitle: string;
}) {
  const snapInstance = getSnap();

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

export function getClientKey() {
  return process.env.MIDTRANS_CLIENT_KEY || "";
}

export function verifySignatureKey(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string
): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
  const payload = orderId + statusCode + grossAmount + serverKey;
  const expectedSignature = crypto.createHash("sha512").update(payload).digest("hex");
  return expectedSignature === signatureKey;
}

export async function getTransactionStatus(orderId: string) {
  const core = getCoreApi();
  return await core.transaction.status(orderId);
}
