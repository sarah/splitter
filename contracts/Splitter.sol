pragma solidity ^0.4.5;

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
        if(msg.sender != funder) throw;

        var (half,remainder) = calculatePayoutAmounts(msg.value);

        // store half with each payee, add to their existing balance
        balances[payee1] += half;
        balances[payee2] += half;

        // store remainder to return to funder
        if(remainder > 0) balances[funder] += remainder;
    }

    function withdrawFunds(){
        address payee = msg.sender;
        if(! isValidPayee(payee) ) throw;
        if( balances[payee] == 0 ) throw;

        // Do all accounting first; it will be reverted if the send fails below
        // store value before resetting to 0
        uint amountDue = balances[payee];
        balances[payee] = 0;
        string memory transferType = (payee == funder) ? "issue_remainder" : "payout";
        LogTransfer(payee, amountDue, transferType);

        // Attempt send
        if(!payee.send(amountDue)) throw;
    }

    function getBalance() returns (uint){
        return address(this).balance;
    }

    function isValidPayee(address payeeCandidate) internal returns (bool){
        return (payeeCandidate == payee1 || payeeCandidate == payee2 || payeeCandidate == funder) ? true : false;
    }

    function calculatePayoutAmounts(uint depositAmt) internal returns(uint, uint){
        // depositAmt is in Wei, so sending 1 ether should send half of that amt in wei to each payee. 
        uint half = depositAmt / 2;
        uint remainder = depositAmt - (half * 2);
        return(half, remainder);
    }
}

