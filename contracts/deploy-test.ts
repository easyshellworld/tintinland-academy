// scripts/deploy.ts

import { createWalletClient, http, createPublicClient, parseEther, decodeEventLog, TransactionReceipt } from 'viem';
import type { Abi, Hex, Log } from 'viem';
import { privateKeyToAccount, generatePrivateKey } from 'viem/accounts';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

interface EnvConfig {
  PRIVATE_KEY: string;
  RPC_URL: string;
}

function getEnvConfig(): EnvConfig {
  const { PRIVATE_KEY, RPC_URL } = process.env;
  if (!PRIVATE_KEY || !RPC_URL) {
    throw new Error('请在 .env 文件中设置 PRIVATE_KEY 和 RPC_URL');
  }
  return { PRIVATE_KEY, RPC_URL };
}

const { PRIVATE_KEY, RPC_URL } = getEnvConfig();

// ESM 下获取当前目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadArtifact(name: string) {
  const artifactPath = path.resolve(__dirname, `artifacts-pvm/contracts/${name}.sol/${name}.json`);
  const json = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  return {
    abi: json.abi as Abi,
    bytecode: ('0x' + json.bytecode) as Hex,
  };
}

type ContractAddress = Hex;

async function deployContract(
  walletClient: ReturnType<typeof createWalletClient>,
  publicClient: ReturnType<typeof createPublicClient>,
  name: string,
  constructorArgs: unknown[] = []
): Promise<ContractAddress> {
  const { abi, bytecode } = loadArtifact(name);
  const hash = await walletClient.deployContract({ abi, bytecode, args: constructorArgs });
  const receipt: TransactionReceipt = await publicClient.waitForTransactionReceipt({ hash });
  if (!receipt.contractAddress) {
    throw new Error(`${name} 部署失败，未返回合约地址`);
  }
  console.log(`✔️  ${name} 部署成功: ${receipt.contractAddress}`);
  return receipt.contractAddress;
}

async function main(): Promise<void> {
  // 创建客户端
  const account = privateKeyToAccount(PRIVATE_KEY);
  console.log('部署者地址:', account.address);

  const walletClient = createWalletClient({ account, transport: http(RPC_URL) });
  const publicClient = createPublicClient({ transport: http(RPC_URL) });

  // 1. 部署实现合约
  const whitelistAddr = await deployContract(walletClient, publicClient, 'Whitelist');
  const customNFTAddr = await deployContract(walletClient, publicClient, 'CustomNFT');
  const claimAddr = await deployContract(walletClient, publicClient, 'Claim');
  const myTokenAddr = await deployContract(walletClient, publicClient, 'MyToken', [
    'MyToken',
    'MTKk',
    18,
    parseEther('1000000', 18),
  ]);

  console.log('\n--- 实现合约部署完成 ---');
  console.table({ whitelistAddr, customNFTAddr, claimAddr, myTokenAddr });

  // 2. 部署工厂并创建项目
  const factoryAddr = await deployContract(walletClient, publicClient, 'Factory3');
  console.log(`\n✔️ Factory3 部署完成: ${factoryAddr}`);

  // 构造 projectId (bytes32)
  const buf = Buffer.alloc(32);
  buf.write('PROJECT_BATCH', 0, 'utf8');
  const projectId = (`0x${buf.toString('hex')}` as Hex);

  // 调用 createProject
  const { abi: factoryAbi } = loadArtifact('Factory3');
  const txHash = await walletClient.writeContract({
    abi: factoryAbi,
    address: factoryAddr,
    functionName: 'createProject',
    args: [projectId, myTokenAddr, 'MyNFT', 'MNFT', 'https://example.com/meta/', parseEther('10', 18)],
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

  // 解析事件
  const log = receipt.logs.find((l: Log) => {
    try {
      const decoded = decodeEventLog({ abi: factoryAbi, data: l.data, topics: l.topics });
      return decoded.eventName === 'ProjectDeployed';
    } catch {
      return false;
    }
  });

  if (!log) throw new Error('未能解析到 ProjectDeployed 事件');

  const decoded = decodeEventLog({ abi: factoryAbi, data: log.data, topics: log.topics });
  const {
    projectId: onChainId,
    whitelistContract,
    nftContract,
    claimContract,
  } = decoded.args as {
    projectId: Hex;
    whitelistContract: Hex;
    nftContract: Hex;
    claimContract: Hex;
  };

  console.log('\n📦 新项目已部署:');
  console.table({ onChainId, whitelistContract, nftContract, claimContract });

  // 3. 多地址测试：生成测试钱包并批量加入白名单
  const TEST_WALLET_COUNT = 5;
  const testAccounts = Array.from({ length: TEST_WALLET_COUNT }, () => {
    const pk = generatePrivateKey();
    const acct = privateKeyToAccount(pk);
    return { address: acct.address, pk, account: acct };
  });

  console.log('\n🧪 测试钱包列表:');
  testAccounts.forEach((w, i) => {
    console.log(`#${i + 1}`, w.address, w.pk);
  });

  console.log('\n✔️ 开始批量添加白名单');
  const { abi: whitelistAbi } = loadArtifact('Whitelist');
  const batchTx = await walletClient.writeContract({
    abi: whitelistAbi,
    address: whitelistContract,
    functionName: 'batchAddToWhitelist',
    args: [testAccounts.map((w) => w.address)],
  });
  await publicClient.waitForTransactionReceipt({ hash: batchTx });

  // 4. 发送 ETH & Token 分发、授权并测试 Claim
  const { abi: tokenAbi } = loadArtifact('MyToken');
  const { abi: claimAbi } = loadArtifact('Claim');
  const { abi: nftAbi } = loadArtifact('CustomNFT');

  // 给每个测试账号发 ETH
  for (const { address } of testAccounts) {
    const tx = await walletClient.sendTransaction({ to: address, value: parseEther('0.001') });
    await publicClient.waitForTransactionReceipt({ hash: tx });
  }
  console.log('✔️ 测试钱包已收 ETH');

  // 授权 Claim 合约
  const approveTx = await walletClient.writeContract({
    abi: tokenAbi,
    address: myTokenAddr,
    functionName: 'approve',
    args: [claimContract, parseEther('1000', 18)],
  });
  await publicClient.waitForTransactionReceipt({ hash: approveTx });

  // 存入 Claim 合约
  const depositTx = await walletClient.writeContract({
    abi: claimAbi,
    address: claimContract,
    functionName: 'deposit',
    args: [parseEther('1000', 18)],
  });
  await publicClient.waitForTransactionReceipt({ hash: depositTx });
  console.log('✔️ 存款到 Claim 合约完成');

  // 每个测试钱包调用 claim()
  let tokenId = 1n;
  for (const { pk, address } of testAccounts) {
    try {
      const client = createWalletClient({
        account: privateKeyToAccount(pk),
        transport: http(RPC_URL),
      });
      const claimTx = await client.writeContract({ abi: claimAbi, address: claimContract, functionName: 'claim' });
      await publicClient.waitForTransactionReceipt({ hash: claimTx });

      const owner = await publicClient.readContract({
        abi: nftAbi,
        address: nftContract,
        functionName: 'ownerOf',
        args: [tokenId],
      });
      console.log(`🎉 ${address} 成功 Claim NFT #${tokenId}`);
      console.log(`    当前持有者: ${owner}`);
      tokenId++;
    } catch (e) {
      console.error(`❌ ${address} Claim 失败:`, e);
    }
  }
}

main().catch((err) => {
  console.error('脚本执行出错:', err);
  process.exit(1);
});
