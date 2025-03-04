const { loadFixture, time } = require("@nomicfoundation/hardhat-toolbox/network-helpers")
const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Factory", function () {
    const FEE = ethers.parseUnits("0.01", 18)

    async function deployFactoryFixture(){
        // read from the blockchain, who are the wallets that are connectedd
        const [deployer, creator, buyer, buyer2] = await ethers.getSigners()

        // Fetch the contract
        const Factory = await ethers.getContractFactory("Factory")
        const factory = await Factory.deploy(FEE)
        
        // Deploy NativeLiquidityPool
        const NativeLiquidityPool = await ethers.getContractFactory("NativeLiquidityPool");
        const liquidityPool = await NativeLiquidityPool.deploy(await factory.getAddress());
        
        // Set the liquidity pool address
        await factory.setLiquidityPool(await liquidityPool.getAddress());
        // Create token from creator perspective
        const transaction = await factory.connect(creator).create("Dapp Uni", "DAPP", "https://pinata.cloud/ipfs",{value: FEE})
        await transaction.wait()

        // Get token address
        const tokenAddress = await factory.tokens(0)
        const token = await ethers.getContractAt("Token", tokenAddress)

        return {factory, token, liquidityPool, deployer, creator, buyer, buyer2}
    }

    async function buyTokenFixture(){
        const {factory, token, liquidityPool, deployer, creator, buyer} = await deployFactoryFixture()

        const AMOUNT = ethers.parseUnits("10000", 18) // buy 10000 tokens
        const COST = ethers.parseUnits("1", 18) // price per token

        // Buy tokens
        const transaction = await factory.connect(buyer).buy(await token.getAddress(), AMOUNT, {value: COST})
        await transaction.wait()

        return {factory, token, liquidityPool, deployer, creator, buyer}
    }

    describe("Deployment", function () {
        it("Should set the fee", async function () {  
            const {factory} = await loadFixture(deployFactoryFixture)
            expect(await factory.fee()).to.equal(FEE)
        })

        it("Should set the owner", async function () {
            const {factory, deployer} = await loadFixture(deployFactoryFixture)
            expect(await factory.owner()).to.equal(deployer.address)
        })
    })

    describe("Creating", function (){
        it("Should create a token", async function (){
            const {factory, token} = await loadFixture(deployFactoryFixture)
            expect(await token.owner()).to.equal(await factory.getAddress())
        })

        it("Should set the creator", async function(){
            const {factory, token, creator} = await loadFixture(deployFactoryFixture)
            expect(await token.creator()).to.equal(creator.address)
        })

        it("Should set the supply", async function(){
            const {factory, token} = await loadFixture(deployFactoryFixture)
            const totalSupply = ethers.parseUnits("1000000", 18)

            expect(await token.balanceOf(await factory.getAddress())).to.equal(totalSupply)
        })

        it("Should update ETH balance", async function(){
            const {factory} = await loadFixture(deployFactoryFixture)

            // get the balance of the contract
            const balance = await ethers.provider.getBalance(await factory.getAddress())

            expect(balance).to.equal(FEE)
        })

        it("Should create the sale", async function (){
            const {factory, token, creator} = await loadFixture(deployFactoryFixture)

            const count = await factory.totalTokens()
            expect(count).to.equal(1)

            const sale = await factory.getTokenSale(0)
            expect(sale.token).to.equal(await token.getAddress())
            expect(sale.creator).to.equal(creator.address)
            expect(sale.sold).to.equal(0)
            expect(sale.raised).to.equal(0)
            expect(sale.isOpen).to.equal(true)
        })
    })
    
    describe("Buying", function () {
        const AMOUNT = ethers.parseUnits("10000", 18) // buy 10000 tokens
        const COST = ethers.parseUnits("1", 18) 
        
        // Check contract received ETH
        it("should update the ETH balance", async function () {
            const {factory} = await loadFixture(buyTokenFixture)
            // get the balance of the contract
            const balance = await ethers.provider.getBalance(await factory.getAddress())
            expect(balance).to.equal(FEE + COST) // theres a listing fee already in the contract

        })
        
        // Check that buyer received tokens
        it("Should update token balances", async function () {
            const {token, buyer} = await loadFixture(buyTokenFixture)

            const balance = await token.balanceOf(buyer.address)

            expect(balance).to.equal(AMOUNT)
        })

        it("should update token sale", async function () {
            const {factory, token} = await loadFixture(buyTokenFixture)

            const sale = await factory.tokenToSale(await token.getAddress())

            expect(sale.sold).to.equal(AMOUNT)
            expect(sale.raised).to.equal(COST)
            expect(sale.isOpen).to.equal(true)
        })

        it("Should increase base cost", async function () {
            const {factory, token} = await loadFixture(buyTokenFixture)
            
            const sale = await factory.tokenToSale(await token.getAddress())
            const cost = await factory.getCost(sale.sold)

            expect(cost).to.be.equal(ethers.parseUnits("0.0002"))
        })
        
        it("should update user contribution", async function (){
            const {factory, token, creator, buyer} = await loadFixture(buyTokenFixture)
            const tokenBalance = await factory.userTokenContributions(await token.getAddress(), buyer.address)
            const ethBalance = await factory.userEthContributions(await token.getAddress(), buyer.address)
            const [contributors, contributions] = await factory.getContributors(await token.getAddress())
            const firstContributor = contributors[0]
            expect(tokenBalance).to.equal(AMOUNT)
            expect(ethBalance).to.equal(COST)
            expect(firstContributor).to.equal(buyer.address)
            expect(contributions[0]).to.equal(COST)

            // buy more tokens
            const buyTx = await factory.connect(buyer).buy(await token.getAddress(), AMOUNT/2n, {value: COST})
            await buyTx.wait()
            const tokenBalance2 = await factory.userTokenContributions(await token.getAddress(), buyer.address)
            const ethBalance2 = await factory.userEthContributions(await token.getAddress(), buyer.address)
            const [contributors2, contributions2] = await factory.getContributors(await token.getAddress())
            const expected_balance = AMOUNT + AMOUNT/2n
            expect(tokenBalance2).to.equal(expected_balance)
            expect(ethBalance2).to.equal(COST*2n)
            expect(contributors2[0]).to.equal(buyer.address)
            expect(contributions2[0]).to.equal(COST*2n)

            // another account buy tokens
            const buyTx2 = await factory.connect(creator).buy(await token.getAddress(), AMOUNT/2n, {value: COST})
            await buyTx2.wait()
            const tokenBalance3 = await factory.userTokenContributions(await token.getAddress(), creator.address)
            const ethBalance3= await factory.userEthContributions(await token.getAddress(), creator.address)
            const [contributors3, contributions3] = await factory.getContributors(await token.getAddress())
            expect(tokenBalance3).to.equal(AMOUNT/2n)
            expect(ethBalance3).to.equal(COST)
            expect(contributors3[0]).to.equal(buyer.address)
            expect(contributors3[1]).to.equal(creator.address)
            expect(contributions3[0]).to.equal(COST*2n)
            expect(contributions3[1]).to.equal(COST)
        })
    })
    describe("Selling", function (){
        // const AMOUNT = ethers.parseUnits("10000", 18) // buy 10000 tokens
        // const COST = ethers.parseUnits("1", 18) 
        // it("should update eth balance", async function (){
        //     const {factory, token, creator, buyer} = await loadFixture(buyTokenFixture)
        //     const balance = await token.balanceOf(buyer.address)
        //     expect(balance).to.equal(AMOUNT)
        //     const [contributors2, contributions2] = await factory.getContributors(await token.getAddress())
        //     console.log(contributors2);
        //     // Add this line to approve the factory to spend tokens
        //     await token.connect(buyer).approve(await factory.getAddress(), AMOUNT/2n)

        //     const sellTx = await factory.connect(buyer).sell(await token.getAddress(), AMOUNT/2n)
        //     await sellTx.wait()
        //     const balanceAfterSell = await token.balanceOf(buyer.address)
        //     expect(balanceAfterSell).to.equal(AMOUNT/2n)

        //     const tokenBalance = await factory.userTokenContributions(await token.getAddress(), buyer.address)
        //     const ethBalance = await factory.userEthContributions(await token.getAddress(), buyer.address)
        //     const [contributors, contributions] = await factory.getContributors(await token.getAddress())
        //     console.log(contributors);
        //     const firstContributor = contributors[0]
        //     expect(tokenBalance).to.equal(AMOUNT)
        //     expect(ethBalance).to.equal(COST)
        //     expect(firstContributor).to.equal(buyer.address)
        //     expect(contributions[0]).to.equal(COST)

        // })

        // it("can't sell more than you have", async function (){
        //     const {factory, token, creator, buyer} = await loadFixture(buyTokenFixture)
        //     const balance = await token.balanceOf(buyer.address)
        //     await token.connect(buyer).approve(await factory.getAddress(), AMOUNT*2n)
        //     await expect(
        //         factory.connect(buyer).sell(await token.getAddress(), AMOUNT*2n)
        //     ).to.be.revertedWith("Insufficient token balance");
        // })

        // it("should update user contribution", async function (){
        //     const {factory, token, creator, buyer} = await loadFixture(buyTokenFixture)
        //     const buyTx = await factory.connect(buyer).buy(await token.getAddress(), AMOUNT/2n, {value: COST})
        //     await buyTx.wait()
        //     const buyTx2 = await factory.connect(creator).buy(await token.getAddress(), AMOUNT/2n, {value: COST})
        //     await buyTx2.wait()
        // })
    })
    describe("Depositing", function () {
        const AMOUNT = ethers.parseUnits("10000", 18) // buy 10000 tokens
        const COST = ethers.parseUnits("2", 18) // price

        it("Sale should be closed and successfully deposits", async function (){
            const {factory, token, liquidityPool, deployer, creator, buyer} = await loadFixture(buyTokenFixture)

            const buyTx = await factory.connect(buyer).buy(await token.getAddress(), AMOUNT, {value: COST})
            await buyTx.wait()

            const sale = await factory.tokenToSale(await token.getAddress())
            expect(sale.isOpen).to.equal(false)
            expect(sale.isLiquidityCreated).to.equal(true); // Liquidity should be created

            // Check liquidity pool balances
            const liquidity = await liquidityPool.liquidity(await token.getAddress());
            const userLiquidity = await liquidityPool.userLiquidity(await token.getAddress(), buyer.address);
            expect(liquidity).to.equal(ethers.parseUnits("3", 18)); 
            expect(userLiquidity).to.equal(ethers.parseUnits("3", 18)); 
        })

        it("should have 2 contributors in liquidity pool", async function (){
            const {factory, token, liquidityPool, deployer, creator, buyer, buyer2} = await loadFixture(buyTokenFixture)
            const HALF_AMOUNT = AMOUNT / 2n;
            const HALF_COST = COST / 2n;

            const buyTx2 = await factory.connect(creator).buy(await token.getAddress(), HALF_AMOUNT, {value: HALF_COST})
            await buyTx2.wait()
            const buyTx = await factory.connect(buyer).buy(await token.getAddress(), HALF_AMOUNT, {value: HALF_COST})
            await buyTx.wait()


            const sale = await factory.tokenToSale(await token.getAddress())
            expect(sale.isOpen).to.equal(false)
            expect(sale.isLiquidityCreated).to.equal(true); // Liquidity should be created

            // Check liquidity pool balances
            const liquidity = await liquidityPool.liquidity(await token.getAddress());
            const buyer1Liquidity = await liquidityPool.userLiquidity(await token.getAddress(), buyer.address);
            const buyer2Liquidity = await liquidityPool.userLiquidity(await token.getAddress(), creator.address);
            expect(liquidity).to.equal(ethers.parseUnits("3", 18)); 
            expect(buyer1Liquidity).to.equal(ethers.parseUnits("2", 18));
            expect(buyer2Liquidity).to.equal(ethers.parseUnits("1", 18)); 
        })
    })

    describe("Withdrawing", function () {
        it("should update ETH balance", async function () {
            const {factory, deployer} = await loadFixture(deployFactoryFixture)

            const transaction = await factory.connect(deployer).withdraw(FEE)
            await transaction.wait()

            const balance = await ethers.provider.getBalance(await factory.getAddress())

            expect(balance).to.equal(0)
        })
    })

    describe("Claiming Reward", function () {
        const AMOUNT = ethers.parseUnits("10000", 18) // buy 10000 tokens
        const COST = ethers.parseUnits("2", 18) // price per token

        it("should claim rewards and cannot claim twice", async function () {
            const {factory, token, buyer} = await loadFixture(buyTokenFixture)
            
            expect(await factory.hasClaimedReward(await token.getAddress(), buyer.address))
            await expect(
                factory.connect(buyer).claimReward(await token.getAddress())
            ).to.be.revertedWith("Liquidity not created yet");

            const buyTx = await factory.connect(buyer).buy(await token.getAddress(), AMOUNT, {value: COST})
            await buyTx.wait()

            const claimRewardTx = await factory.connect(buyer).claimReward(await token.getAddress())
            await claimRewardTx.wait()

            expect(await factory.hasClaimedReward(await token.getAddress(), buyer.address))
            await expect(
                factory.connect(buyer).claimReward(await token.getAddress())
            ).to.be.revertedWith("Reward already claimed");
            tokenBalance = await token.balanceOf(buyer.address)
            const sale = await factory.getTokenSale(0) 
            const rewards = sale.raised.toString() * 0.03
            const expectedBalance = ethers.parseUnits(rewards.toString(), 0) + AMOUNT*2n
            expect(ethers.parseUnits(tokenBalance.toString(), 0)).to.equal(expectedBalance)
        })
    })

    describe("Get Token Price", function () {
        const AMOUNT = ethers.parseUnits("10000", 18) // buy 10000 tokens
        const COST = ethers.parseUnits("2", 18) // price per token

        it("should get token price", async function () {
            const {factory, token, buyer} = await loadFixture(buyTokenFixture)
            const tokenPrice = await factory.getPriceForTokens(await token.getAddress(), AMOUNT)
            expect(tokenPrice).to.equal(COST)
        })
    });
})

describe("NativeLiquidityPool", function () {
    const FEE = ethers.parseUnits("0.01", 18)
    const AMOUNT = ethers.parseUnits("10000", 18) // buy 10000 tokens
    const COST = ethers.parseUnits("1", 18) // price per token

    async function deployLiquidityPoolFixture() {
        const [deployer, creator, contributor, contributor2, contributor3] = await ethers.getSigners();
        const Factory = await ethers.getContractFactory("Factory");
        const factory = await Factory.deploy(FEE);

        const NativeLiquidityPool = await ethers.getContractFactory("NativeLiquidityPool");
        const liquidityPool = await NativeLiquidityPool.deploy(await factory.getAddress());
        // Set the liquidity pool address
        await factory.setLiquidityPool(await liquidityPool.getAddress());

        const transaction = await factory.connect(creator).create("Dapp Uni", "DAPP", "https://pinata.cloud/ipfs",{value: FEE})
        await transaction.wait()

        // Get token address
        const tokenAddress = await factory.tokens(0)
        const token = await ethers.getContractAt("Token", tokenAddress)

        return { factory, token, liquidityPool, deployer, creator, contributor, contributor2, contributor3 };
    }

    async function addLiquidityFixture(){
        const {factory, token, liquidityPool, deployer, creator, contributor, contributor2, contributor3} = await deployLiquidityPoolFixture()
        const transaction = await factory.connect(contributor).buy(await token.getAddress(), AMOUNT, {value: COST})
        await transaction.wait()

        const transaction2 = await factory.connect(contributor2).buy(await token.getAddress(), AMOUNT/2n, {value: COST})
        await transaction2.wait()

        const transaction3 = await factory.connect(contributor3).buy(await token.getAddress(), AMOUNT/2n, {value: COST})
        await transaction3.wait()

        return {factory, token, liquidityPool, deployer, creator, contributor, contributor2, contributor3}
    }

    describe("Liquidity Operations", function () {
        const liquidityAmount = ethers.parseUnits("1", 18);

        it("Should allow users to remove liquidity and receive ETH and tokens", async function () {
            const { factory, token, liquidityPool, deployer, creator, contributor } = await loadFixture(deployLiquidityPoolFixture);

            await expect(
                liquidityPool.connect(deployer).removeLiquidity(await token.getAddress(), liquidityAmount)
            ).to.be.revertedWith("Insufficient liquidity");
        });

        it("should not allow users to remove liquidity and receive ETH and tokens", async function () {
            const { token, liquidityPool, deployer, creator, contributor, contributor2, contributor3 } = await loadFixture(addLiquidityFixture);
            await expect(
                liquidityPool.connect(contributor).removeLiquidity(await token.getAddress(), liquidityAmount)
            ).to.be.revertedWith("Liquidity is still locked");
        });

        it("remove liquidity", async function () {
            const { token, liquidityPool, deployer, creator, contributor, contributor2, contributor3 } = await loadFixture(addLiquidityFixture);
            await time.increase(604801);
            await liquidityPool.connect(contributor).removeLiquidity(await token.getAddress(), liquidityAmount);
            const remainingLiquidity = await liquidityPool.liquidity(await token.getAddress());
            expect(remainingLiquidity).to.equal(COST*2n);
            expect(await liquidityPool.userLiquidity(await token.getAddress(), contributor.address)).to.equal(0);

            await expect(
                liquidityPool.connect(contributor).removeLiquidity(await token.getAddress(), liquidityAmount)
            ).to.be.revertedWith("Insufficient liquidity");
            
            expect(await liquidityPool.userLiquidity(await token.getAddress(), contributor2.address)).to.equal(COST);
            await liquidityPool.connect(contributor2).removeLiquidity(await token.getAddress(), liquidityAmount);
            const remainingLiquidity2 = await liquidityPool.liquidity(await token.getAddress());
            expect(remainingLiquidity2).to.equal(COST);
            expect(await liquidityPool.userLiquidity(await token.getAddress(), contributor2.address)).to.equal(0);

            expect(await liquidityPool.userLiquidity(await token.getAddress(), contributor3.address)).to.equal(COST);
            await liquidityPool.connect(contributor3).removeLiquidity(await token.getAddress(), liquidityAmount);
            const remainingLiquidity3 = await liquidityPool.liquidity(await token.getAddress());
            expect(remainingLiquidity3).to.equal(0);
            expect(await liquidityPool.userLiquidity(await token.getAddress(), contributor3.address)).to.equal(0);
        });
        it("should allow users to remove partial liquidity", async function () {
            const { token, liquidityPool, deployer, creator, contributor, contributor2, contributor3 } = await loadFixture(addLiquidityFixture);
            const userWithdraw = liquidityAmount/2n;
            const tokenBalance = await token.balanceOf(await liquidityPool.getAddress());
            const liquidityBalance = await liquidityPool.liquidity(await token.getAddress());
            const tokenUserReceive = (userWithdraw*tokenBalance)/liquidityBalance;
            await time.increase(604801);
            await liquidityPool.connect(contributor).removeLiquidity(await token.getAddress(), liquidityAmount/2n);
            const remainingLiquidity = await liquidityPool.liquidity(await token.getAddress());
            expect(remainingLiquidity).to.equal(COST*2n + COST/2n);
            expect(await liquidityPool.userLiquidity(await token.getAddress(), contributor.address)).to.equal(liquidityAmount/2n);
            expect(await token.balanceOf(contributor)).to.equal(tokenUserReceive + AMOUNT);
        });
        it("swap eth for tokens", async function () {
            const { token, liquidityPool, deployer, creator, contributor, contributor2, contributor3  } = await loadFixture(addLiquidityFixture);
            const ethAmount = ethers.parseUnits("1", 18);
            initBalance = await token.balanceOf(contributor.address)
            tokenReserve = await token.balanceOf(await liquidityPool.getAddress());
            ethReserve = await liquidityPool.liquidity(await token.getAddress()); 
            expectedBalance = initBalance + tokenReserve*ethAmount/(ethReserve + ethAmount)
            await liquidityPool.connect(contributor).swapEthForToken(await token.getAddress(), { value: ethAmount });
            expect(await token.balanceOf(contributor.address)).to.equal(expectedBalance);
        });

        it("swap tokens for eth", async function () {
            const { token, liquidityPool, contributor } = await loadFixture(addLiquidityFixture);
            const tokenAmount = ethers.parseUnits("5000", 18); // swap 5000 tokens

            await token.connect(contributor).approve(await liquidityPool.getAddress(), tokenAmount);

            initBalance = await ethers.provider.getBalance(contributor.address)
            tokenReserve = await token.balanceOf(await liquidityPool.getAddress());
            ethReserve = await liquidityPool.liquidity(await token.getAddress())
            const expectedEthOut = tokenAmount*ethReserve/(tokenReserve + tokenAmount);
            console.log("expectedEthOut", expectedEthOut);
            await liquidityPool.connect(contributor).swapTokenForEth(await token.getAddress(), tokenAmount);
            afterBalance = await ethers.provider.getBalance(contributor.address)
            console.log("initBalance", initBalance.toString());
            console.log("afterBalance", afterBalance.toString());
            console.log("difference", afterBalance-initBalance);
            expect(await token.balanceOf(contributor.address)).to.equal(tokenAmount);
            const remainingLiquidity = ethReserve - await liquidityPool.liquidity(await token.getAddress())
            expect(remainingLiquidity).to.equal(expectedEthOut)
        });

        it("get estimated token for eth", async function () {
            const { token, liquidityPool, deployer, creator, contributor, contributor2, contributor3  } = await loadFixture(addLiquidityFixture);
            const ethAmount = ethers.parseUnits("1", 18);
            tokenReserve = await token.balanceOf(await liquidityPool.getAddress());
            ethReserve = await liquidityPool.liquidity(await token.getAddress()); 
            const expectedTokenOut = ethAmount*tokenReserve/(ethReserve+ethAmount);
            const estimatedTokenOut = await liquidityPool.getEstimatedTokensForEth(await token.getAddress(), ethAmount);
            expect(estimatedTokenOut).to.equal(expectedTokenOut);
        });

        it("get estimated eth for token", async function () {
            const { token, liquidityPool, deployer, creator, contributor, contributor2, contributor3  } = await loadFixture(addLiquidityFixture);
            const tokenAmount = ethers.parseUnits("5000", 18);
            tokenReserve = await token.balanceOf(await liquidityPool.getAddress());
            ethReserve = await liquidityPool.liquidity(await token.getAddress()); 
            const expectedEthOut = tokenAmount*ethReserve/(tokenReserve + tokenAmount);
            const estimatedEthOut = await liquidityPool.getEstimatedEthForTokens(await token.getAddress(), tokenAmount);
            expect(estimatedEthOut).to.equal(expectedEthOut);
        });
    });
})