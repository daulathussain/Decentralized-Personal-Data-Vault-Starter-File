export const IDENTITY_REGISTRY_ABI = [
  {
    type: "constructor",
    inputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "createVault",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getVaultOwner",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "vaultExists",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getVault",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "owner", type: "address" },
          { name: "createdAt", type: "uint256" },
          { name: "exists", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "VaultCreated",
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
] as const;

export const VAULT_MANAGER_ABI = [
  {
    type: "constructor",
    inputs: [{ name: "_identityRegistry", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "registerFile",
    inputs: [{ name: "fileHash", type: "bytes32" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "grantAccess",
    inputs: [
      { name: "grantee", type: "address" },
      { name: "fileHash", type: "bytes32" },
      { name: "expiresAt", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "revokeAccess",
    inputs: [
      { name: "grantee", type: "address" },
      { name: "fileHash", type: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "hasAccess",
    inputs: [
      { name: "grantee", type: "address" },
      { name: "fileHash", type: "bytes32" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getFileRecord",
    inputs: [{ name: "fileHash", type: "bytes32" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "fileHash", type: "bytes32" },
          { name: "owner", type: "address" },
          { name: "registeredAt", type: "uint256" },
          { name: "exists", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getOwnerFiles",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "bytes32[]" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "FileRegistered",
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "fileHash", type: "bytes32", indexed: true },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "AccessGranted",
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "grantee", type: "address", indexed: true },
      { name: "fileHash", type: "bytes32", indexed: true },
      { name: "expiresAt", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "AccessRevoked",
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "grantee", type: "address", indexed: true },
      { name: "fileHash", type: "bytes32", indexed: true },
    ],
  },
] as const;

export const ACCESS_CONTROLLER_ABI = [
  {
    type: "constructor",
    inputs: [
      { name: "_vaultManager", type: "address" },
      { name: "_identityRegistry", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "requestAccess",
    inputs: [
      { name: "fileHash", type: "bytes32" },
      { name: "reason", type: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "approveAccess",
    inputs: [
      { name: "requester", type: "address" },
      { name: "fileHash", type: "bytes32" },
      { name: "accessDuration", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "rejectAccess",
    inputs: [
      { name: "requester", type: "address" },
      { name: "fileHash", type: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getFileRequests",
    inputs: [{ name: "fileHash", type: "bytes32" }],
    outputs: [
      {
        type: "tuple[]",
        components: [
          { name: "requester", type: "address" },
          { name: "fileHash", type: "bytes32" },
          { name: "status", type: "uint8" },
          { name: "createdAt", type: "uint256" },
          { name: "processedAt", type: "uint256" },
          { name: "reason", type: "string" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPendingRequestStatus",
    inputs: [
      { name: "requester", type: "address" },
      { name: "fileHash", type: "bytes32" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "AccessRequested",
    inputs: [
      { name: "requester", type: "address", indexed: true },
      { name: "fileHash", type: "bytes32", indexed: true },
      { name: "timestamp", type: "uint256", indexed: false },
      { name: "reason", type: "string", indexed: false },
    ],
  },
  {
    type: "event",
    name: "AccessApproved",
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "requester", type: "address", indexed: true },
      { name: "fileHash", type: "bytes32", indexed: true },
      { name: "expiresAt", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "AccessRejected",
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "requester", type: "address", indexed: true },
      { name: "fileHash", type: "bytes32", indexed: true },
    ],
  },
] as const;

export const DATA_MARKETPLACE_ABI = [
  {
    type: "constructor",
    inputs: [{ name: "_treasury", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "purchaseData",
    inputs: [
      { name: "category", type: "string" },
      { name: "recordCount", type: "uint256" },
    ],
    outputs: [{ name: "purchaseToken", type: "bytes32" }],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "getPurchase",
    inputs: [{ name: "token", type: "bytes32" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "buyer", type: "address" },
          { name: "category", type: "string" },
          { name: "recordCount", type: "uint256" },
          { name: "amountPaid", type: "uint256" },
          { name: "timestamp", type: "uint256" },
          { name: "purchaseToken", type: "bytes32" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getBuyerPurchases",
    inputs: [{ name: "buyer", type: "address" }],
    outputs: [{ name: "", type: "bytes32[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "requiredPayment",
    inputs: [{ name: "recordCount", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "PRICE_PER_RECORD",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "DataPurchased",
    inputs: [
      { name: "buyer", type: "address", indexed: true },
      { name: "category", type: "string", indexed: false },
      { name: "recordCount", type: "uint256", indexed: false },
      { name: "amountPaid", type: "uint256", indexed: false },
      { name: "purchaseToken", type: "bytes32", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
] as const;
