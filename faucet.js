require("dotenv").config();
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const constants = require("./constants");
const {Secp256k1HdWallet} = require("@cosmjs/amino");
const {SigningStargateClient,GasPrice} = require("@cosmjs/stargate");
const {stringToPath} = require("@cosmjs/crypto");
const restAPI=process.env.BLOCKCHAIN_REST_SERVER;
const rpc = process.env.RPC;
const mnemonic = process.env.FAUCET_MNEMONIC;
const msgSendTypeUrl = "/cosmos.bank.v1beta1.MsgMultiSend";
const {MsgMultiSend, fromPartial} = require("cosmjs-types/cosmos/bank/v1beta1/tx");

function trimWhiteSpaces(data){
    return data.split(' ').join('');
}

function msg(inputs, outputs) {
    return {
        typeUrl: msgSendTypeUrl,
        value: MsgMultiSend.fromPartial({
            inputs: [
                {
                    address: trimWhiteSpaces(inputs),//fromAddress
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
        test: MsgMultiSend
    }
}

async function Transaction(wallet, signerAddress, msgs, fee, memo = '') {
    const cosmJS = await SigningStargateClient.connectWithSigner(rpc, wallet);
    const res = msgs[0].value.outputs[0].coins[0];
    return await cosmJS.signAndBroadcast(signerAddress, msgs, fee, memo); //DeliverTxResponse, 0 iff success  
}

async function MnemonicWalletWithPassphrase(mnemonic) {
    const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, {prefix: constants.prefix, bip39Password:'',hdPaths:[stringToPath("m/44'/118'/0'/0/0")]});
    const [firstAccount] = await wallet.getAccounts();
    return [wallet, firstAccount.address];
  
}

function runner() {
    setInterval(async function ()  {
        if (constants.FaucetList.length > 0) {
            try{
                let [wallet, addr] = await MnemonicWalletWithPassphrase(mnemonic);
                let outputs = [];
                
                constants.FaucetList.forEach(reciever => outputs.push({
                    address: trimWhiteSpaces(reciever),
                    coins: [
                        {
                            denom: constants.DENOM,
                            amount: constants.AMOUNT,
                        },
                    ],
                }));
                const msgs = msg(addr, outputs);
                await Transaction(
                        wallet, 
                        addr, 
                        [msgs], 
                        {"amount": [{amount : (parseInt(constants.gas) * GasPrice.fromString(constants.gas_price).amount).toString(), denom : constants.DENOM}], "gas": constants.gas},
                        "Thanks for using Faucet"
                    ).then(response => console.log(response));
                constants.FaucetList.splice(0, constants.FaucetList.length);
            }catch(e){
                console.log("Transaction Failed: ", e);
            }           
        } else {
             console.log("No Accounts to faucet");
        }
    }, 10000);
}

function handleFaucetRequest(userAddress) {
    try {
        let xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", restAPI + "/cosmos/auth/v1beta1/accounts/" + userAddress, false); // false for synchronous request
        xmlHttp.send(null);
        const accountResponse = JSON.parse(xmlHttp.responseText);
        if (constants.FaucetList.length < constants.FAUCET_LIST_LIMIT &&
            !constants.FaucetList.includes(userAddress) && 
            accountResponse.code === 5) {
            constants.FaucetList.push(userAddress);
            console.log(userAddress, "ADDED TO LIST: total = ", constants.FaucetList.length);
            return JSON.stringify({result: "Success, your address will be faucet"});
        } else {
            console.log(userAddress, "NOT ADDED: total = ", constants.FaucetList.length);
            return JSON.stringify({result: "Failure, your account cannot be faucet right now, please try after sometime"});
        }
    } catch (e) {
        return JSON.stringify({result:"Failure, Incorrect Address"});
    }

}

module.exports = {runner, handleFaucetRequest,MnemonicWalletWithPassphrase,Transaction};
