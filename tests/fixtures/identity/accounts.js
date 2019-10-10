// Account address
export const address = '0x31ea8795EE32D782C8ff41a5C68Dcbf0F5B27f6d';
export const addressXpub =
  'xpub6DojZ5fC8cSLRwc95PFfzUDWUSRod2jSWSbhGKEWFJhoTDiJgRva4am9m7ex1Fm1Ege8MDQ7PNEFqkzdgsRS6UooRfDZpgHkD8vNHiMP3zq';
export const addressHdChild = '0xC2013cAf34b224572B66F4d44313E73D437EB6E3';
export const checksumAddress = '0x31ea8795EE32D782C8ff41a5C68Dcbf0F5B27f6d';

export const v3password = 'password123';
export const email = 'user@example.com';
export const regularPassword = 'regularPassword';
export const otpCode = 123456;


export const accountList = [address, addressXpub, addressHdChild];

// mnemonic for hdv3
export const mnemonic =
  'seed sock milk update focus rotate barely fade car face mechanic mercy';

export const v3Child = {
  version: 3,
  id: '92859312-69c4-4db9-b607-4070b7261295',
  address: addressHdChild,
  crypto: {
    ciphertext:
      '2974a8843fd16d66d21f082cd22a9c285a7345cb2ce7bc0099758a0940739919',
    cipherparams: { iv: 'b70af6f17247fe6dce518277fbd20b9f' },
    cipher: 'aes-128-ctr',
    kdf: 'scrypt',
    kdfparams: {
      dklen: 32,
      salt: '238f976dcbc3c6200f223c3985de4f1922ced0d4bfa957459122d208d44fd7ea',
      n: 1024,
      r: 8,
      p: 1,
    },
    mac: 'e8a8102051cf80316289bc16ae66bb67a7eb27532e1f816f34bc5b98621f4fd1',
  },
};

// Encrypted keystore for a normal account
export const v3 = {
  crypto: {
    cipher: 'aes-128-ctr',
    ciphertext:
      '7cac2d65101c01254fb250dba8187f36c41e6ae3a23c01c3dc570c29e60ef7d4',
    cipherparams: { iv: 'dd4807d2443fcb886bf681f8c22bfaba' },
    mac: 'b90d786c672d8ffeadc14080f951c4f2e96b7952578a807b78cc0498c9bf5147',
    kdf: 'scrypt',
    kdfparams: {
      dklen: 32,
      n: 1024,
      r: 1,
      p: 8,
      salt: '77b9ef18416f5bc4f48bdb1de9e9d2d493f868287241c6066d609f92ab8c468e',
    },
  },
  id: '01eb1f7c-a482-4bc5-98ec-8101417b5134',
  version: 3,
  address,
};

// Encrypted keystore for an hd account
export const hdv3 = {
  address: addressXpub,
  crypto: {
    cipher: 'aes-128-ctr',
    cipherparams: { iv: 'b58264d466c90f8924f3a6c13ee64463' },
    ciphertext:
      'fea516b5cf51e6d0b5d5c83fc1673a1f0e2563b4523fb409a655a9d53b1e0055586ff4182fbebf00a52a585f595abd917970ab79f8938e5dc60f841a170af265e77ecca1d20beff845db276f8bbe',
    kdf: 'scrypt',
    kdfparams: {
      dklen: 32,
      n: 4,
      p: 8,
      r: 1,
      salt: '951266735f664dc8f0911b8c424d79b285cb962fc0b980b3937f821f912963e2',
    },
    mac: '5e7db9b83ca75c1be99c3587d5dc6882892b3c4556924606eb499da52e38b942',
  },
  id: '26c91dbc-f900-4d7c-8ec5-a9a59c0ecd81',
  version: 3,
};

export const hdv3Info = {
  address: addressXpub,
  hidden: false,
  type: 'HDMainAccount',
  index: 0,
  label: '',
};

export const v3Info = {
  address,
  hidden: false,
  type: 'StandardAccount',
  index: 0,
  label: '',
};

export const v3InfoChild = {
  address: addressHdChild,
  hidden: false,
  type: 'StandardAccount',
  index: 0,
  label: '',
};

// 0xc551A996fE68A4347df54747488ECEF50DD2ACf9

// Private key buffer for v3
export const privateKey =
  '0x070dc3117300011918e26b02176945cc15c3d548cf49fd8418d97f93af699e46';
