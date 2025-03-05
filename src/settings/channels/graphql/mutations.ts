const commonParamsDef = `
  $name: String!,
  $description: String,
  $memberIds: [String],
  $skillIds: [String],
  $integrationIds: [String]
  $assignementConfig: JSON
`;

const commonParams = `
  name: $name,
  description: $description,
  memberIds: $memberIds,
  skillIds: $skillIds,
  integrationIds: $integrationIds
  assignementConfig: $assignementConfig
`;

const channelAdd = `
  mutation channelsAdd(${commonParamsDef}) {
    channelsAdd(${commonParams}) {
      _id
    }
  }
`;

const channelEdit = `
  mutation channelsEdit($_id: String!, ${commonParamsDef}) {
    channelsEdit(_id: $_id, ${commonParams}) {
      _id
    }
  }
`;

const channelRemove = `
  mutation channelsRemove($_id: String!) {
    channelsRemove(_id: $_id)
  }
`;

export default {
  channelAdd,
  channelEdit,
  channelRemove
};
