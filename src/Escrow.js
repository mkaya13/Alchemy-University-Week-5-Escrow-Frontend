export default function Escrow({
  address,
  arbiter,
  beneficiary,
  value,
  handleApprove,
  contractAddress,
  chainId,
  escrowStatus,
}) {
  return (
    <div className="existing-contract">
      <ul className="fields">
        <li>
          <div> Arbiter: </div>
          <div> {arbiter} </div>
        </li>
        <li>
          <div> Beneficiary: </div>
          <div> {beneficiary} </div>
        </li>
        <li>
          <div> Value: </div>
          <div> {value / Math.pow(10, 18)} Ether </div>
        </li>
        <li>
          <div> Contract Address: </div>
          <div> {contractAddress} </div>
        </li>
        <li>
          <div> Contract Network: </div>
          <div> {chainId === 31337 ? "Localhost" : "Goerli"} </div>
        </li>
        <li>
          <div> Escrow Status: </div>
          <div>
            {" "}
            {escrowStatus === 0
              ? "Open"
              : escrowStatus === 1
              ? "Operating"
              : escrowStatus === 2
              ? "Fulfilled"
              : "Cancelled"}
          </div>
        </li>
        <div
          className="button"
          id={address}
          onClick={(e) => {
            e.preventDefault();

            handleApprove();
          }}
        >
          Approve
        </div>
      </ul>
    </div>
  );
}
