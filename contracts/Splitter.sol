pragma solidity ^0.4.5;

/*
   Consider what will happen if r2's address is a hostile or errant contract that decides to throw every time. Is there any way for r1 to get paid? Is it r1's fault that r2 is misbehaving? This Splitter is a simple example. In a more complex scenario there may be many participants. We don't want a situation where one bad actor can interfere with everyone else because that creates an opportunity for DoS.

   Since we usually want to throw in the case that something unexpected is happening, and since we don't want one bad actor to interfere with others' proper use of the contract, a solution is to separate our communications in different transactions that can succeed or fail independently.

   A good rule of thumb is a contract should never talk to more than one untrusted contract at a time.

   The sender might be Alice, or it might be someone/something else, so that too is untrusted. That means the deposit itself is a conversation with an untrusted contract. We might say initiating a second conversation with a second untrusted contract is off limits. This obviously limits the further steps we can do in the payable function.

   Consider separating deposit and withdrawal functions. Hint: owedToR1 += half;

   I also wanted to mention ... The last bit about being nice is understandable but it can lead to trouble with smart contracts. Unlike other environments where we might strive to give the user useful feedback and detailed logs, error messages, etc., in a smart contract our priorities have to be application integrity, simplicity and code readability. Being "nice" adds unwanted complexity that will make it hard to reason about more complex code.

   Fail early and fail hard. Don't explain. It's not the contract's job to explain what went wrong. A good default setting for a developer is to throw at the first opportunity, destroy the gas, and explain nothing. :-)
 */

contract Splitter{
    address recipient1;
    address recipient2;
    address funder;

    struct Payout {
        address addr;
        uint amount;
        bool paid;
        bool errored;
        bool isFunder;
    }

    // nobody outside of the contract should be able to create a Payout
    Payout[] internal payouts;

    event LogTransfer(
        address indexed _recipient,
        uint _value,
        string _transfer_type
    );

    event LogDebug(
        string _thing
    );

    event LogPayoutAttempt(
        uint _which,
        address _addr,
        uint _amt,
        string _msg
    );

    event LogDeposit(
            string _msg,
            uint _half,
            uint _remainder,
            address _funder

    );
    function Splitter(address owner, address r1, address r2) {
        LogDebug("deploying");
        funder = owner;
        recipient1 = r1;
        recipient2 = r2;
    }

    function getBalance() returns (uint){
        return address(this).balance;
    }

    function calculatePayoutAmounts(uint depositAmt) internal returns(uint, uint){
        LogDebug("calculatePayoutAmounts");

        uint half = depositAmt / 2;
        uint remainder = depositAmt - (half * 2);
        return(half, remainder);
    }

    function deposit() payable{
        LogDebug("making deposit");
        if(msg.sender == funder){
            var (half,remainder) = calculatePayoutAmounts(msg.value);
            LogDeposit("making a deposit", half,remainder, funder);

            // only create Payout structs if we've confirmed msg.sender is the funder
            // & only create them for our known recipients
            payouts.push(Payout(recipient1, half, false, false, false));
            payouts.push(Payout(recipient2, half, false, false, false));
            payouts.push(Payout(funder, remainder, false, false, true));

            executePayouts();
        } else {
            throw;
        }
    }

    function executePayouts(){
        uint extraRemainder = 0;
        LogDebug("Starting Payouts");

        // Payouts have already been created
        for (uint i = 0; i < payouts.length; i++) {
            Payout p = payouts[i];
            LogPayoutAttempt(i,p.addr,p.amount,"normal");

            // Attempt send if not previously paid / attempted
            if(!p.paid && !p.errored){
                if(!p.isFunder){
                    if(!p.addr.send(p.amount)){
                        p.errored = true;

                        // aggregate unsent money to return to sender
                        extraRemainder += p.amount;
                        p.amount = 0;
                    } else {
                        p.paid = true;
                        LogTransfer(p.addr,p.amount,"payout");
                    }    
                } else {

                    // Send funds to owner if there are any
                    LogPayoutAttempt(i,p.addr,p.amount,"to funder first");
                    if(extraRemainder > 0 || p.amount > 0){
                        p.amount += extraRemainder;
                        LogPayoutAttempt(i,p.addr,p.amount,"to funder");
                        if(!p.addr.send(p.amount)){
                            throw;
                        } else {
                            LogTransfer(p.addr,p.amount,"return_to_sender");
                        }
                    }
                }
            }
        }
    }
}

