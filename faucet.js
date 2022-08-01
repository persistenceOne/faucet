require("dotenv").config();
const constants = require("./constants");
const {Secp256k1HdWallet} = require("@cosmjs/amino");
const {SigningStargateClient, GasPrice} = require("@cosmjs/stargate");
const {stringToPath} = require("@cosmjs/crypto");
const rpc = process.env.RPC;
const mnemonic = process.env.FAUCET_MNEMONIC;
const msgSendTypeUrl = "/cosmos.bank.v1beta1.MsgMultiSend";
const {MsgMultiSend} = require("cosmjs-types/cosmos/bank/v1beta1/tx");
const {fromBech32} = require("@cosmjs/encoding");

function trimWhiteSpaces(data) {
    return data.split(' ').join('');
}

function msg(inputAddr, outputs) {
    return {
        typeUrl: msgSendTypeUrl,
        value: MsgMultiSend.fromPartial({
            inputs: [
                {
                    address: trimWhiteSpaces(inputAddr),//fromAddress
                    coins: [
                        {
                            denom: constants.DENOM,
                            amount: (outputs.length * parseInt(constants.AMOUNT)).toString(),
                        },
                    ],
                },
            ],
            outputs: outputs,//toAddress
        }),
    }
}

async function Transaction(wallet, signerAddress, msgs, memo = '') {
    const cosmJS = await SigningStargateClient.connectWithSigner(rpc, wallet, {gasPrice: GasPrice.fromString(constants.gas_price)});
    return await cosmJS.signAndBroadcast(signerAddress, msgs, "auto", memo); //DeliverTxResponse, 0 iff success
}

async function MnemonicWalletWithPassphrase(mnemonic) {
    const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, {
        prefix: constants.prefix,
        bip39Password: '',
        hdPaths: [stringToPath(constants.HD_PATH)]
    });
    const [firstAccount] = await wallet.getAccounts();
    return [wallet, firstAccount.address];

}

function delay(x) {
    return new Promise((done, fail) => setTimeout(done, x));
}

async function runner() {
    console.log("started faucet loop")

    // noinspection InfiniteLoopJS
    while (true) {
        if (constants.FaucetList.length > 0) {
            try {
                let [wallet, addr] = await MnemonicWalletWithPassphrase(mnemonic);
                let outputs = [];

                constants.FaucetList.forEach(receiver => outputs.push({
                    address: trimWhiteSpaces(receiver),
                    coins: [
                        {
                            denom: constants.DENOM,
                            amount: constants.AMOUNT,
                        },
                    ],
                }));
                const msgs = msg(addr, outputs);
                const response = await Transaction(
                    wallet,
                    addr,
                    [msgs],
                    "Thanks for using Faucet"
                );
                console.log(response);
                constants.FaucetList.splice(0, constants.FaucetList.length);
            } catch (e) {
                console.log("Transaction Failed: ", e);
            }
        } else {
            console.log("No Accounts to faucet");
        }
        await delay(constants.FAUCET_SLEEP) // this allows the function to be async
    }
}

function handleFaucetRequest(userAddress) {
    try {
        fromBech32(userAddress)
        if (constants.FaucetList.length < constants.FAUCET_LIST_LIMIT &&
            !constants.FaucetList.includes(userAddress)) {
            constants.FaucetList.push(userAddress);
            console.log(userAddress, "ADDED TO LIST: total = ", constants.FaucetList.length);
            return JSON.stringify({result: "Success, your address will be faucet: " + userAddress});
        } else {
            console.log(userAddress, "NOT ADDED: total = ", constants.FaucetList.length);
            return JSON.stringify({result: "Failure, your account cannot be faucet right now, please try after sometime: " + userAddress});
        }
    } catch (e) {
        return JSON.stringify({result: "Failure, Incorrect Address: " + userAddress});
    }

}

module.exports = {runner, handleFaucetRequest, MnemonicWalletWithPassphrase, Transaction};
