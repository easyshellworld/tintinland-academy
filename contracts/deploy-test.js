import { createWalletClient, http, createPublicClient, parseEther, decodeEventLog } from 'viem';
import { privateKeyToAccount, generatePrivateKey } from 'viem/accounts';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前模块的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const MY_TOKEN_ADDRESS = process.env.MY_TOKEN_ADDRESS;
const RPC_URL = process.env.RPC_URL;

// 环境变量校验
if (!PRIVATE_KEY || !MY_TOKEN_ADDRESS || !RPC_URL) {
  throw new Error('请在 .env 文件中设置 PRIVATE_KEY、MY_TOKEN_ADDRESS 和 RPC_URL');
}

const account = privateKeyToAccount(PRIVATE_KEY);

const walletClient = createWalletClient({
  account,
  transport: http(RPC_URL),
});

const publicClient = createPublicClient({
  transport: http(RPC_URL),
});

function loadAbi(name) {
  const abiPath = path.resolve(__dirname, `artifacts-pvm/contracts/${name}.sol/${name}.json`);
  const json = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
  return json.abi;
}

function loadBytecode(name) {
  const bytecodePath = path.resolve(__dirname, `artifacts-pvm/contracts/${name}.sol/${name}.json`);
  const json = JSON.parse(fs.readFileSync(bytecodePath, 'utf8'));
  return '0x' + json.bytecode;
}

async function deploy(name) {
  const abi = loadAbi(name);
  const bytecode = loadBytecode(name);
  const hash = await walletClient.deployContract({ abi, bytecode, args: [] });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log(`${name} 部署成功:`, receipt.contractAddress);
  return receipt.contractAddress;
}

async function main() {
  console.log('部署者地址:', account.address);

  // 1. 部署工厂合约
  console.log('\n--- 部署工厂合约 ---');
  const factoryAddr = await deploy('Factory3');
  console.log(`部署完成工厂地址：${factoryAddr}`);

  // 2. 调用 createProject 并解析事件
  console.log('\n--- 测试创建项目 ---');
  const factoryAbi = loadAbi('Factory3');

  // 构造 bytes32 格式的 projectId
  const buf = Buffer.alloc(32);
  buf.write('PROJECT_BATCH'); 
  const projectId = '0x' + buf.toString('hex');

  // 发起 createProject 交易
  const txHash = await walletClient.writeContract({
    abi: factoryAbi,
    address: factoryAddr,
    functionName: 'createProject',
    args: [
      projectId,
      MY_TOKEN_ADDRESS,
      'MyNFT',
      'MNFT',
      'https://example.com/meta/',
      parseEther('10'), 
    ],
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

  // 解析 ProjectDeployed 事件日志
  const eventLog = receipt.logs.find((log) => {
    try {
      const decoded = decodeEventLog({
        abi: factoryAbi,
        data: log.data,
        topics: log.topics,
      });
      return decoded.eventName === 'ProjectDeployed';
    } catch {
      return false;
    }
  });

  if (!eventLog) {
    throw new Error('未能解析到 ProjectDeployed 事件');
  }

  const decodedEvent = decodeEventLog({
    abi: factoryAbi,
    data: eventLog.data,
    topics: eventLog.topics,
  });

  const { projectId: onChainId, whitelistContract, nftContract, claimContract } = decodedEvent.args;
  console.log('📦 新项目已部署:');
  console.log('  Project ID (链上):', onChainId);
  console.log('  Whitelist 合约地址:', whitelistContract);
  console.log('  NFT 合约地址:', nftContract);
  console.log('  Claim 合约地址:', claimContract);

  // 3. 多地址测试
  console.log('\n--- 开始多地址测试 ---');
  const walletCount = 5;
  const wallets = [];
  const addresses = [];

  for (let i = 0; i < walletCount; i++) {
    const pk = generatePrivateKey();
    const acct = privateKeyToAccount(pk);
    wallets.push({ account: acct, privateKey: pk });
    addresses.push(acct.address);
  }
  console.log('🧪 生成的测试地址与私钥:');
  wallets.forEach((item, i) => {
    console.log(`[${i + 1}] 地址: ${item.account.address}, 私钥: ${item.privateKey}`);
  });

  // 批量加入白名单
  const whitelistAbi = loadAbi('Whitelist');
  await walletClient.writeContract({
    abi: whitelistAbi,
    address: whitelistContract,
    functionName: 'batchAddToWhitelist',
    args: [addresses],
  });
  console.log('✅ 批量白名单地址添加完成');

  // 分发 ETH 和 Token
  const tokenAbi = loadAbi('MyToken');
  for (const { account: acct } of wallets) {
    await walletClient.sendTransaction({
      to: acct.address,
      value: parseEther('1'),
    });
    await walletClient.writeContract({
      abi: tokenAbi,
      address: MY_TOKEN_ADDRESS,
      functionName: 'transfer',
      args: [acct.address, parseEther('100')],
    });
  }

  // 存入 Claim 合约
  await walletClient.writeContract({
    abi: tokenAbi,
    address: MY_TOKEN_ADDRESS,
    functionName: 'approve',
    args: [claimContract, parseEther('10000')],
  });
  const claimAbi = loadAbi('Claim');
  await walletClient.writeContract({
    abi: claimAbi,
    address: claimContract,
    functionName: 'deposit',
    args: [parseEther('10000')],
  });

  const balance = await publicClient.readContract({
    abi: tokenAbi,
    address: MY_TOKEN_ADDRESS,
    functionName: 'balanceOf',
    args: [claimContract],
  });
  console.log('\n📥 Claim 合约余额:', balance.toString());

  // 执行 Claim 测试
  const nftAbi = loadAbi('CustomNFT');
  let tokenId = 1;
  for (const { account: acct } of wallets) {
    try {
      const claimClient = createWalletClient({
        account: acct,
        transport: http(RPC_URL),
      });
      const tx = await claimClient.writeContract({
        abi: claimAbi,
        address: claimContract,
        functionName: 'claim',
        args: [],
      });
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log(`🎉 ${acct.address} 成功 Claim NFT #${tokenId}`);

      const nftOwner = await publicClient.readContract({
        abi: nftAbi,
        address: nftContract,
        functionName: 'ownerOf',
        args: [BigInt(tokenId)],
      });
      const tokenBalance = await publicClient.readContract({
        abi: tokenAbi,
        address: MY_TOKEN_ADDRESS,
        functionName: 'balanceOf',
        args: [acct.address],
      });
      console.log(`     NFT #${tokenId} 当前持有者: ${nftOwner}`);
      console.log(`     当前 MTK 余额: ${tokenBalance.toString()} wei\n`);
      tokenId++;
    } catch (err) {
      console.error(`❌ ${acct.address} Claim 失败`, err);
    }
  }
}

main().catch((err) => {
  console.error('脚本执行出错:', err);
  process.exit(1);
});