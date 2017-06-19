pragma solidity ^0.4.5;

//Consider what will happen if r2's address is a hostile or errant contract that decides to throw every time. Is there any way for r1 to get paid? Is it r1's fault that r2 is misbehaving? This Splitter is a simple example. In a more complex scenario there may be many participants. We don't want a situation where one bad actor can interfere with everyone else because that creates an opportunity for DoS.
contract Splitter{
    address public recipient1;
    address public recipient2;
    address public funder;

    event LogTransfer(
        address indexed _recipient,
        uint _value,
        string _transfer_type
    );

    function Splitter(address owner, address r1, address r2) payable{
        funder = owner;
        recipient1 = r1;
        recipient2 = r2;
    }

    function getBalance() returns (uint){
        return address(this).balance;
    }

    function payInto() payable returns (bool) {
        if (msg.sender == funder){
            uint half = msg.value / 2;
            uint etherLeftOver = msg.value - (half * 2);

            if(half > 0){
                if(!recipient1.send(half)){
                    throw;
                } else {
                    LogTransfer(recipient1, half, 'split');
                }
                if (!recipient2.send(half)){
                    throw;
                } else {
                    LogTransfer(recipient2, half, 'split');
                }
            } else {
                return false;
            }

            // return change
            if (etherLeftOver > 0){
                if (!funder.send(etherLeftOver)){
                    throw;
                } else {
                    LogTransfer(funder, etherLeftOver, 'return_change');
                }
            }
        } else {
            // if alice is not the sender
            // Let's return $ to sender b/c we're kind,
            // even though it costs gas
            if (!msg.sender.send(msg.value)){
                throw;
            } else {
                LogTransfer(msg.sender,msg.value, 'return_to_sender');
            }
        }
        return true;
    }
}
