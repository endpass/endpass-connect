import { DOC_STATUSES } from '@fixtures/identity/documents/statuses';

const documentsFixturesFactory = (id, status = DOC_STATUSES.DRAFT) => ({
  id,
  status,
  createdAt: 1566550179,
  documentType: 'Passport',
  areaType: 'Internal',
  description: 'Custom document description',
  imageId:
    '656f4084-9c6b-484c-b3a4-5397ac6f5272/bf0ef61c-4e12-47a5-9c69-27b05f1a24cd',
  imageHash: '0481c3955888b4a643923c4170c43a0399730866da6a4314857db5c7bbafc3d9',
  mimeType: 'image/jpeg',
  backImageId: '',
  backImageHash: '',
  backMimeType: '',
  firstName: '',
  lastName: '',
  number: '',
  dateOfBirth: -62135596800,
  dateOfIssue: -62135596800,
  dateOfExpiry: -62135596800,
  issuingCountry: '',
  issuingAuthority: '',
  issuingPlace: '',
  address: '',
});

export const uploadedDocumentId = '1fc7b927-ba24-4549-a528-6db707dcd1c6';

export const documentsList = [
  ['67e5acc5-02f2-4661-9f95-cb231a29beeb', DOC_STATUSES.RECOGNITION],
  ['1d7c3798-3a05-4ff2-a646-2f7231fb5d26', DOC_STATUSES.RECOGNITION],
  ['b85cde82-90bf-4a9a-8016-6dcc4d3fb851', DOC_STATUSES.RECOGNITION],
  ['9ba9b26b-45df-4bc5-94fb-a7c5cfa3065a', DOC_STATUSES.RECOGNITION],
  ['76c90eb4-3bcc-4095-ba91-771cc889fbb5', DOC_STATUSES.RECOGNITION],
  ['9853b4b2-bc12-4c5a-9e64-aadff774c7ee', DOC_STATUSES.VERIFIED],
  ['14ca4c6f-3ed0-49d5-bc7e-441d79363010', DOC_STATUSES.VERIFIED],
  ['b6ff6e5f-fc54-4ce6-baf7-4ed5c91f50a2', DOC_STATUSES.VERIFIED],
  ['c415abf5-c4b3-4b4d-8fd2-079423f9c249', DOC_STATUSES.VERIFIED],
  ['9ff37846-cbf1-4e46-9b22-76356f4ba170', DOC_STATUSES.VERIFIED],
  ['d57a1115-57a4-4eda-9f99-a10ebe0a1f78', DOC_STATUSES.NOT_VERIFIED],
  ['e793719b-6975-46ab-8019-e46e1c6f99fe', DOC_STATUSES.NOT_VERIFIED],
  ['62eefdcd-0462-445e-83a2-5a522ec8ebb3', DOC_STATUSES.NOT_VERIFIED],
  ['b05060ef-06f1-460d-8668-75b938e29568', DOC_STATUSES.NOT_VERIFIED],
  ['a0b314ff-8f15-4822-8f63-dc807d3942ba', DOC_STATUSES.NOT_VERIFIED],
  ['4692a700-7de7-4290-a03a-f2006343b135', DOC_STATUSES.DRAFT],
  ['c4a2cd5e-e4bd-4a50-be87-a7ed99b18b2c', DOC_STATUSES.DRAFT],
  ['9eb624dc-cca4-48e5-8390-45de81b60b4e', DOC_STATUSES.DRAFT],
  ['cc038a09-cf14-4497-8781-a10dc0c58421', DOC_STATUSES.DRAFT],
  ['d6a2ebab-657e-4c94-b983-84c67b845c3c', DOC_STATUSES.DRAFT],
  ['069aad5c-e396-43e6-8b84-253bbe9e9a87', DOC_STATUSES.NOT_READABLE],
  ['05d46d89-8d9b-4982-ae85-e676b60b6f8b', DOC_STATUSES.NOT_READABLE],
  ['d68881e1-5920-496e-9ebd-95f9985e7409', DOC_STATUSES.NOT_READABLE],
  ['b47175f0-a3f2-432e-aa32-ffd383ee1a84', DOC_STATUSES.NOT_READABLE],
  ['76440838-bfec-46eb-9ae2-232e0bc29189', DOC_STATUSES.NOT_READABLE],
].map(item => documentsFixturesFactory(item[0], item[1]));

export const document = documentsList[0];

export const documentVerified = {
  ...document,
  id: '9853b4b2-bc12-4c5a-9e64-aadff774c7ee',
  status: DOC_STATUSES.VERIFIED,
};

export const uploadedDocument = {
  ...document,
  id: uploadedDocumentId,
  status: DOC_STATUSES.PENDING_REVIEW,
};

export const documentFrontUpload = {
  front: {
    status: 'Uploaded',
    message:
      'a8c94a41-dfea-4ee1-a714-18a9fd10f51d/d1cf8e0f-64ee-4261-96cb-584e185ab701',
  },
  back: {
    status: 'NoContent',
    message: '',
  },
};

export const documentLog = {
  reviewer: '2f49e05d-eb3d-40a8-bbd4-e953b2000b4b',
  status: DOC_STATUSES.VERIFIED,
  createdAt: 1562317606,
  message: 'approved',
};

export const documentLogList = [documentLog];

export const docStatusesMap = {
  docId: {
    front: { status: 'Uploaded' },
    back: { status: 'Uploaded' },
  },
};
