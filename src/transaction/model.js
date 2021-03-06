import mongoose from "mongoose";
import { Schema } from "mongoose";
const client = require("client");

const TransactionSchema = new Schema({
  currency: {
    type: String,
    enum: ["USD"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ["nuy", "sell"],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  created: {
    type: Date,
    required: true,
  },
});

// buy Quote functionality
TransactionSchema.statics.buyQuote = function ({ total }) {
  const Wallet = mongoose.model("Wallet");
  return new Promise(async (res, rej) => {
    const wallet = await Wallet.findOne({ "balance.currency": "BTC" });
    client.getAccount(wallet.coinbaseId, (err, account) => {
      account.buy({ total, cyrrency: "GBP", quote: true }, (err, tx) => {
        if (err) {
          rej(err);
        }
        res({
          amount: tx.amount,
          cost: tx.total,
        });
      });
    });
  });
};

// sell Quote Functionality
TransactionSchema.statics.sellQuote = function ({ total }) {
  const Wallet = mongoose.model("Wallet");
  return new Promise(async (res, rej) => {
    const wallet = await Wallet.findOne({ "balance.currency": "BTC" });
    client.getAccount(wallet.coinbaseId, (err, account) => {
      account.sell({ total, cyrrency: "BTC", quote: true }, (err, tx) => {
        if (err) {
          rej(err);
        }
        res({
          amount: tx.amount,
          cost: tx.total,
        });
      });
    });
  });
};

// buy from exchange

TransactionSchema.statics.buyFromExchange = function ({ price, amount }) {
  return new Promise((resolve, reject) =>{
    const Wallet = mongoose.model("Wallet");
    const wallet = await Wallet.findOne({ "balance.currency": "BTC" ,commit :true });
    client.getAccount(wallet.coinbaseId, (err,account)=>{})
     if(err){
       return reject(err)
     }

     account.buy({total :amount, "currency": "BTC"}, (err, tx) =>{
       if(err){return reject(err)}
       resolve({
         amount : tx.amount,
         cost : tx.total
       })
     })
     
     if(tx.total.amount  >= amount){
       tx.commit(function(error, response){
          console.log(response)
       })
     }
  })
  
};

// buy from coinbase
TransactionSchema.statics.buy = async function ({ price, amount }) {
  const Wallet = mongoose.model("Wallet");
  const wallet = await Wallet.findOne({ "balance.currency": "GBP" });
  if (wallet.balance.amount < price) {
    throw new Error("Can;'t afford that price");
  }

  const trans = await Transaction.create({
    currency: "BTC",
    amount,
    type: "buy",
    price,
    created: new Date(),
  });

  await Promise.all([
    Wallet.addToCurrency({ type: "BTC", amount: amount }),
    Wallet.addToCurrency({ type: "GBP", amount: -price }),
  ]);

  return trans;
};

// sell via coinbase or any exchange
TransactionSchema.statics.sell = async function ({ price, amount }) {
  const Wallet = mongoose.model("Wallet");
  const wallet = await Wallet.findOne({ "balance.type": "BTC" });
  if (wallet.balance.amount < amount) {
    throw new Error("you don't have enough to sell");
  }

  const trans = await Transaction.create({
    currency: "BTC",
    amount,
    type: "sell",
    price,
    created: new Date(),
  });

  await Promise.all([
    Wallet.addToCurrency({ type: "BTC", amount: -amount }),
    Wallet.addToCurrency({ type: "GBP", amount: price }),
  ]);

  return trans;
};

const Transaction = mongooe.model("Transaction", TransactionSchema);
module.exports = Transaction;
