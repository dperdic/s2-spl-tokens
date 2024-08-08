import { useState } from "react";

export default function TransferTokens() {
  const [recipientAddress, setRecipientAddress] = useState<string>();

  const transferTokens = async () => {};

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <input
        type="string"
        placeholder="Recipient address"
        value={recipientAddress}
        onChange={event => {
          setRecipientAddress(event.target.value);
        }}
        className="w-full sm:max-w-72 border px-3 py-2 shadow-sm block w-full border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
      />

      <button
        type="button"
        className="btn btn-sm btn-blue"
        onClick={async () => {
          await transferTokens();
        }}
      >
        Transfer tokens
      </button>
    </div>
  );
}
