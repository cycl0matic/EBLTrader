import { get } from "../configuration";
// https://github.com/coinbase/coinbase-node
import coinbase from "coinbase";
import { Client } from "coinbase";

const pricing = require("../pricing");
const database = require("../database");
const util = require("util");
const Price = require("../models/price");
const Trading = require("../trading");
// const moment = require("moment");
const Wallet = require("../wallet/model");

const setTimeoutPromise = util.promisify(setTimeout);
const time = 10 * 1000;

const mainLoop = async () => {
  try {
    const prices = await pricing.getPrices();
    const price = await Price.create(prices);
    console.log(prices);
    await Trading.onPrice(price);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  start: async () => {
    await database.connect();
    await Wallet.initialize();
    // const start = moment().subtract(3, "days").subtract(2, "hours").toDate();
    // const end = moment().subtract(3, "days").toDate();
    // const next6 = moment().subtract(3, "days").add(1, "hours").toDate();
    // const period = 1;
    // const bollinger = await Trading.getBollinger({ start, period, end });
    // const prices = await Price.getRange({ start: end, end: next6 });
    // Trading.showAvailable({ bollinger, prices });
    setInterval(mainLoop, tiem);
    mainLoop();
  },
};
