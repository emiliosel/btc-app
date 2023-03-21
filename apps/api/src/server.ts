import { json } from "body-parser";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import { BTCService } from "./services/btc.service";
import { getConnection } from "./mongodb";
import { AddressSubscriptionsRepository } from "./repositories/address-subscriptions.repository";
import { TransactionSubscriptionsRepository } from "./repositories/transaction-subscriptions.repository";

export const createServer = async () => {
  const app = express();

  const dbConnection = await getConnection();
  const addressSubscRepo = new AddressSubscriptionsRepository(dbConnection);
  const transactionSubscRepo = new TransactionSubscriptionsRepository(dbConnection);

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
        const transactionInfo = await btcService.getAddressInfo(address);
        return res.json({ transaction: transactionInfo });
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
        const transactionInfo = await btcService.getTransactionInfo(
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
    });

  return app;
};
