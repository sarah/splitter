pragma solidity ^0.4.5;

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
                if (!recipient1.send(half) && !recipient2.send(half)){
                    throw;
                } else {
                    LogTransfer(recipient1, half, 'split');
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
