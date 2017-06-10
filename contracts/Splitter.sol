pragma solidity ^0.4.5;

contract Splitter{
    address ethSentFrom;
    address alice = address(0x00000000000000000000000053ddb6ede750474b);
    address bob = address(0x9421e7733ce28c3a31bfc9c60aba030edf8d7c6f);
    address carol = address(0x86ed0b13d365020854f1a8f101cc002d00076726);
    uint half;

    event EthIncoming(
        address indexed _from,
        uint _value
    );

    event Transfer(
        address indexed _to,
        uint value
    );

    event NotSplitting(
        address indexed _from,
        uint value
    );

    event Splitting(
        address indexed _from,
        uint value
    );

    function Splitter() payable{
        ethSentFrom =  msg.sender;
    }

    function getBalance() returns (uint){
        return address(this).balance;
    }

    function payInto() payable {
        ethSentFrom = msg.sender;
        EthIncoming(ethSentFrom, msg.value);
        if (ethSentFrom == alice){
            Splitting(ethSentFrom,msg.value);
            split(msg.value);
        } else {
            NotSplitting(ethSentFrom, msg.value);
        }
    }

    function split (uint amount) returns (bool success){
        half = amount / 2; 
        sendSplitTo(bob,half);
        sendSplitTo(carol,half);
        return true;
    }

    function sendSplitTo (address to, uint amount) returns(bool success){
        if (!to.send(amount))
            throw;
        Transfer(to,amount);
        return true;
    }
}
