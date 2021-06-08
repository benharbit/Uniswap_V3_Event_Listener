///on uniswapv3
//impliment callback events on pool
//and impliment orderbook implimentation on 




const JSBI = require('jsbi');
const Web3 = require('web3');
const ethers = require('ethers');
const ABI = require('./abis2.json'); // Contract ABI
const V3_pool_ABI = require('./UniswapV3Pool.json')

const V3_factory_ABI = require('./uniswapfactoryV3abi.json')



const addresses = require('./addresses2.json'); 
const contracts_info = require('./contracts_info_by_addresses.json')
const contracts_by_symbol = require('./contracts_info.json')


const addresses_a = require('./addresses'); // Contract ABI

var arr = [];
Object.keys(ABI).forEach(function(key) {
  console.log('Key : ' + key + ', Value : ') //+ data[key]);
  arr.push(key);
  console.log("ttt" + key )

})

var address_arr = [];
Object.keys(addresses).forEach(function(key) {
  address_arr.push(key);
})



factoryV3_address = '0x1F98431c8aD98523631AE4a59f267346ea31F984';

let pool_descriptions = new Map()


	const web3 = new Web3(

  new Web3.providers.WebsocketProvider("infura websocket address or your own nodes websocket connetioin")
 
);

	factoryV3 = new web3.eth.Contract(V3_factory_ABI.factory, factoryV3_address)






function get_uniswap_v3_price(digits_token_0,digits_token_1,sqrtPriceX96) {
  
 
 var mult_0 = JSBI.BigInt(10)**digits_token_0;
 var mult_1 = JSBI.BigInt(10)**digits_token_1;
 var mult_2;
 var number = 0;

if(mult_0>mult_1){
  	mult_2 =  JSBI.BigInt(mult_0/mult_1);
  	number1 = sqrtPriceX96 *sqrtPriceX96 * mult_2/(JSBI.BigInt(2) ** (JSBI.BigInt(192)));

}
else{
	number1 = sqrtPriceX96 *sqrtPriceX96/(JSBI.BigInt(2) ** (JSBI.BigInt(192))) * mult_2;
}

 return number1;
 
 }





async function watch_Swap_event_of_pool_v3(address1, address2,fee) {





	var pool_address =  await factoryV3.methods.getPool(address1,address2,fee).call();



	pool_descriptions.set(pool_address,contracts_info[address1].symbol + " " + contracts_info[address2].symbol + " " + fee/10000 + "% ")

	var pool_1 = new web3.eth.Contract(V3_pool_ABI.abi, pool_address);


	var slot0 = await pool_1.methods.slot0.call().call();
	var token0 = await pool_1.methods.token0.call().call();
	var token1 = await pool_1.methods.token1.call().call();
	var symbol_0 = contracts_info[token0].symbol;
	var symbol_1 = contracts_info[token1].symbol;

	var ten = JSBI.BigInt(10)



	var event = pool_1.events.Swap().on('data',function(event){
		//console.log("zzzzz"+" "+ JSON.stringify(event))
		var rtn1 = event.returnValues;
		var sender = rtn1["0"];
		var receiver = rtn1["1"];
		var amount0 = JSBI.BigInt(rtn1["2"]);
		var amount1 = JSBI.BigInt(rtn1["3"]);
		var sqrtprice96 = rtn1["4"];
		var liquidity = rtn1["5"];
		var tick = rtn1["6"];
		var price = 0;

		var price = get_uniswap_v3_price(contracts_info[address1].decimals, contracts_info[address2].decimals, sqrtprice96);
	
		if(price<1.0 && (symbol_0=="weth" || symbol_1=="weth")){
			price = 1.0/price;

		}
		var quant0 = Number(amount0/(ten ** JSBI.BigInt(contracts_info[token0].decimals)));
		var quant1 = Number(amount1/(ten ** JSBI.BigInt(contracts_info[token1].decimals)));


		console.log("trade in " + pool_descriptions.get(event.address) + " pool  XXXXXXs")

		if(quant0>0)
			console.log(" bought "+  quant0 + " " + symbol_0 + " for " + quant1 + " " + symbol_1 + " " + price.toFixed(2))
		else
			console.log(" sold " +  quant0 + " "  + symbol_0 + " for " + quant1 + " " + symbol_1 + " " + price.toFixed(2) )

	});

}

address1 = contracts_by_symbol['weth'].address;
address2 = contracts_by_symbol['dai'].address;
fee_level = 3000;
watch_Swap_event_of_pool_v3(address1,address2,fee_level)



address1 = contracts_by_symbol['weth'].address;
address2 = contracts_by_symbol['usdt'].address;
fee_level = 3000;


watch_Swap_event_of_pool_v3(address1,address2,fee_level)










