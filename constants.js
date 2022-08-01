const FAUCET_LIST_LIMIT = +process.env.FAUCET_LIST_LIMIT;
const AMOUNT = process.env.AMOUNT;
const DENOM = process.env.DENOM;
const CHAIN_ID = process.env.CHAIN_ID;
const prefix= process.env.PREFIX;
const gas_price = process.env.GAS_PRICE;
const IP_WINDOW = +process.env.IP_WINDOW;
const IP_DRIP_LIMIT = +process.env.IP_DRIP_LIMIT;
const HD_PATH = process.env.HD_PATH;
const FAUCET_SLEEP = +process.env.FAUCET_SLEEP;
const PORT = +process.env.FAUCET_PORT
let FaucetList=[];
module.exports = {
    FAUCET_LIST_LIMIT,
    AMOUNT,
    DENOM,
    CHAIN_ID,
    FaucetList,
    prefix,
    gas_price,
    IP_WINDOW,
    IP_DRIP_LIMIT,
    FAUCET_SLEEP,
    HD_PATH,
    PORT
}
