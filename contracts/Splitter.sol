pragma solidity ^0.4.5;

/*
I suspect you sense unwanted complexity creeping in. You're still trying to do it all at once and also working with row-wise arrays and loops.

A little nudge in the right direction:

    mapping(address => uint) balances;

function depositFunds() payable {}
function withdrawFunds() {}

What would happen if the contract just kept track of who is owed and the claimants had to pay for gas to get the funds out?
 */

contract Splitter{
    address funder;
    address payee1;
    address payee2;

    event LogTransfer(
        address indexed _recipient,
        uint _value,
        string _transfer_type
    );

    mapping(address => uint) public balances;

    function Splitter(address _funder, address _payee1, address _payee2) {
        funder = _funder ;
        payee1 = _payee1;
        payee2 = _payee2;
    }

    function depositFunds() payable{
        if(msg.sender == funder){
            var (half,remainder) = calculatePayoutAmounts(msg.value);

            // store half with each payee
            balances[payee1] = half;
            balances[payee2] = half;

            // store remainder to return to funder
            if(remainder > 0) balances[funder] = remainder;
        } else {
            throw;
        }
    }

    function withdrawFunds(address payee){
        if(isValidPayee(payee)){
            uint amountDue = balances[payee];
            if( amountDue > 0 ){
                if(!payee.send(amountDue)){
                    throw;
                } else {
                    balances[payee] = 0;
                    
                    string memory transfer_type = (payee == funder) ? "issue_remainder" : "payout";
                    LogTransfer(payee, amountDue, transfer_type);
                }
            }
        } else {
            throw;
        }
    }

    function getBalance() returns (uint){
        return address(this).balance;
    }

    function isValidPayee(address payeeCandidate) internal returns (bool){
        return (payeeCandidate == payee1 || payeeCandidate == payee2 || payeeCandidate == funder) ? true : false;
    }

    function calculatePayoutAmounts(uint depositAmt) internal returns(uint, uint){
        // this should be in Wei, so sending 1 ether should send half of 
        // that amt in wei to each payee. 
        uint half = depositAmt / 2;
        uint remainder = depositAmt - (half * 2);
        return(half, remainder);
    }
}
