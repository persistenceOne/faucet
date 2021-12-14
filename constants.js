
const FAUCET_LIST_LIMIT = 15;
const AMOUNT = "1";
const DENOM = "uatom";
const CHAIN_ID = "pstake-staking-gala";
let FaucetList=[];
const prefix= "cosmos";
const gas_price = "0uatom";
const gas = "500000";
const IP_WINDOW = 24 * 60 * 60 * 1000;
const IP_DRIP_LIMIT = 10;

module.exports = {
    FAUCET_LIST_LIMIT,
    AMOUNT,
    DENOM,
    CHAIN_ID,
    FaucetList,
    prefix,
    gas_price,
    gas,
    IP_WINDOW,
    IP_DRIP_LIMIT
}