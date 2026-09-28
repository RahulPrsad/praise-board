// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/// @notice Immutable, permissionless tip ledger. No fees, moderation, or upgrades.
contract PraiseBoard {
    struct Tip { address supporter; uint256 amount; uint64 timestamp; string name; string note; }
    address payable public immutable beneficiary;
    uint256 public totalTipped;
    Tip[] private tips;
    bool private withdrawing;
    error InvalidBeneficiary(); error EmptyTip(); error TextTooLong();
    error Unauthorized(); error WithdrawalFailed(); error NoFunds(); error Reentrant();
    event TipReceived(uint256 indexed id, address indexed supporter, uint256 amount, string name, string note, uint64 timestamp);
    event Withdrawn(address indexed beneficiary, uint256 amount);
    constructor(address payable recipient) { if (recipient == address(0)) revert InvalidBeneficiary(); beneficiary = recipient; }
    function tip(string calldata name, string calldata note) external payable {
        if (msg.value == 0) revert EmptyTip();
        if (bytes(name).length > 40 || bytes(note).length > 280) revert TextTooLong();
        uint256 id = tips.length;
        tips.push(Tip(msg.sender, msg.value, uint64(block.timestamp), name, note));
        totalTipped += msg.value;
        emit TipReceived(id, msg.sender, msg.value, name, note, uint64(block.timestamp));
    }
    function tipCount() external view returns (uint256) { return tips.length; }
    function getTip(uint256 id) external view returns (Tip memory) { return tips[id]; }
    function getTips(uint256 offset, uint256 limit) external view returns (Tip[] memory result) {
        require(limit <= 50, "Page too large");
        if (offset >= tips.length) return new Tip[](0);
        uint256 end = offset + limit; if (end > tips.length) end = tips.length;
        result = new Tip[](end - offset);
        for (uint256 i = offset; i < end; i++) result[i-offset] = tips[i];
    }
    function withdraw() external {
        if (msg.sender != beneficiary) revert Unauthorized();
        if (withdrawing) revert Reentrant();
        uint256 amount = address(this).balance; if (amount == 0) revert NoFunds();
        withdrawing = true;
        (bool ok,) = beneficiary.call{value: amount}("");
        if (!ok) revert WithdrawalFailed();
        withdrawing = false;
        emit Withdrawn(beneficiary, amount);
    }
}
