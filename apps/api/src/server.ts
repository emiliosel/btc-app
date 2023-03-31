import { json } from "body-parser";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import { BTCService } from "./services/btc.service";
import { getConnection } from "./mongodb";
import { AddressSubscriptionsRepository } from "./repositories/address-subscriptions.repository";
import { TransactionSubscriptionsRepository } from "./repositories/transaction-subscriptions.repository";
import { NotificationsRepository } from "./repositories/notification.repository";

export const createServer = async () => {
  const app = express();

  const dbConnection = await getConnection();
  const addressSubscRepo = new AddressSubscriptionsRepository(dbConnection);
  const transactionSubscRepo = new TransactionSubscriptionsRepository(dbConnection);
  const notificationRepo = new NotificationsRepository(
    dbConnection
  );

  await transactionSubscRepo.init();
  await addressSubscRepo.init();

  // TODO: add config
  const btcService = new BTCService({
    host: 'btc_node',
    username: "bitcoinrpc",
    password: "qDVRUlIJq/Tnq9xPObuhQ2dOWhZX1WEmgAcnrf9kqmtw",
    network: "regtest",
    port: 18443, // default port for regtest
  });

  app
    .disable("x-powered-by")
    .use(morgan("dev"))
    .use(json())
    .use(cors())
    .get("/api/v1/addressInfo", async (req, res) => {
      const address = req.query.address;

      if (!address) {
        return res.status(400).json({ message: '"address" is required!' });
      }

      if (typeof address !== "string") {
        return res.status(400).json({ message: '"address" must be a string!' });
      }

      try {
        const addressInfo = await btcService.apiGetAddressInfo(address);
        return res.json({ address: addressInfo });
      } catch (er) {
        console.log(`[ERROR]: ${(er as Error).message}`);

        if ((er as Error).message === "Invalid address") {
          return res.status(400).json({ message: '"address" is invalid!' });
        }

        return res.status(500).json({ message: "Server error!" });
      }
    })
    .get("/api/v1/transactionInfo", async (req, res) => {
      const transactionId = req.query.transactionId;

      if (!transactionId) {
        return res
          .status(400)
          .json({ message: '"transactionId" is required!' });
      }

      if (typeof transactionId !== "string") {
        return res
          .status(400)
          .json({ message: '"transactionId" must be a string!' });
      }

      try {
        const transactionInfo = await btcService.apiGetTransactionInfo(
          transactionId
        );
        return res.json({ transaction: transactionInfo });
      } catch (er) {
        console.log(`[ERROR]: ${(er as Error).message}`);
        return res.status(500).json({ message: "Server error!" });
      }
    })

    .get("/api/v1/addresses", async (req, res) => {
      try {
        const addresses = await btcService.getAddresses();
        return res.json({ addresses });
      } catch (er) {
        console.log(`[ERROR]: ${(er as Error).message}`);
        return res.status(500).json({ message: "Server error!" });
      }
    })

    .get("/api/v1/notifications", async (req, res) => {
      try {
        const userId = req.query.userId;
        const queryLimit = parseInt(req.query.limit);
        const after = req.query.after;
        const limit = !isNaN(queryLimit) && queryLimit < 100 && queryLimit > 0 ? queryLimit : 10;

        const notifications = await notificationRepo.getNotifications(userId, {
          limit, 
          after,
        });
        return res.json({ notifications });
      } catch (er) {
        console.log(`[ERROR]: ${(er as Error).message}`);
        return res.status(500).json({ message: "Server error!" });
      }
    })

    .post("/api/v1/createAddress", async (req, res) => {
      try {
        const address = await btcService.getNewAddress({});
        return res.status(201).json({ address });
      } catch (er) {
        console.log(`[ERROR]: ${er.message}`);
        return res.status(500).json({ message: "Server error!" });
      }
    })
    .post("/api/v1/subscribeToAddress", async (req, res) => {
      const { address, userId } = req.body;
      try {
        const id = await addressSubscRepo.createSubscription({
          address,
          userId,
        });
        return res.status(201).json({ subscriptionId: id });
      } catch (er) {
        console.log(`[ERROR]: ${er.message}`);
        return res.status(500).json({ message: "Server error!" });
      }
    })
    .post("/api/v1/subscribeToTransaction", async (req, res) => {
      const { transaction, userId } = req.body;
      try {
        const id = await transactionSubscRepo.createSubscription({
          transaction,
          userId,
        });
        return res.status(201).json({ subscriptionId: id });
      } catch (er) {
        console.log(`[ERROR]: ${er.message}`);
        return res.status(500).json({ message: "Server error!" });
      }
    })

    .post("/api/v1/generateForAddress", async (req, res) => {
      const { blocks, address } = req.body;
      try {
        await btcService.generateToAddress(address, blocks);
        return res.status(201).json({ ok: true });
      } catch (er) {
        console.log(`[ERROR]: ${er.message}`);
        return res.status(500).json({ message: "Server error!" });
      }
    })

    .post("/api/v1/generateForAddress", async (req, res) => {
      const { blocks, address } = req.body;
      try {
        await btcService.generateToAddress(address, blocks);
        return res.status(201).json({ ok: true });
      } catch (er) {
        console.log(`[ERROR]: ${er.message}`);
        return res.status(500).json({ message: "Server error!" });
      }
    })

    .post("/api/v1/transfer", async (req, res) => {
      const { amount, toAddress } = req.body;
      try {
        const txid = await btcService.transferBitcoin(toAddress, amount);
        return res.status(201).json({ ok: true, txid });
      } catch (er) {
        console.log(`[ERROR]: ${er.message}`);
        return res.status(500).json({ message: "Server error!" });
      }
    });

  return app;
};
