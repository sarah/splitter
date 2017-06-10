pragma solidity ^0.4.5;

contract Splitter{
    address private alice = address(0x594f46cb925ebd73a364335f53ddb6ede750474a);
    address private bob = address(0x9421e7733ce28c3a31bfc9c60aba030edf8d7c6f);
    address private carol = address(0x86ed0b13d365020854f1a8f101cc002d00076726);

    event EthIncoming(
        address indexed _sender,
        uint _value
    );

    event Transfer(
        address indexed _recipient,
        uint value
    );

    event NotSplitting(
        address indexed _sender,
        uint value
    );

    event Splitting(
        address indexed _sender,
        uint value
    );

    function Splitter() payable{}

    function getBalance() returns (uint){
        return address(this).balance;
    }

    function payInto() payable {
        EthIncoming(msg.sender, msg.value);
        if (msg.sender == alice){
            Splitting(msg.sender,msg.value);

            var half = msg.value / 2;

            // send to bob
            if (!bob.send(half)){
                throw;
            } else {
                Transfer(bob, half);
            }

            // send to carol
            if (!carol.send(half)){
                throw;
            } else {
                Transfer(carol, half);
            }

        } else {
            NotSplitting(msg.sender, msg.value);
        }
    }
}
