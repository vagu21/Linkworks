import UserModelHelper from "./UserModelHelper";

const INCLUDE_MEDIA_FILE = true;

const includeParentRows = {
  parent: {
    include: {
      createdByUser: { select: UserModelHelper.selectSimpleUserProperties },
      createdByApiKey: true,
      values: { include: { media: INCLUDE_MEDIA_FILE, multiple: true, range: true } },
    },
  },
};
const includeChildRowsNested = {
  child: {
    include: {
      createdByUser: { select: UserModelHelper.selectSimpleUserProperties },
      createdByApiKey: true,
      values: { include: { media: INCLUDE_MEDIA_FILE, multiple: true, range: true } },
      parentRows: {
        include: {
          parent: {
            include: {
              values: { include: { media: INCLUDE_MEDIA_FILE, multiple: true, range: true } },
            },
          },
        },
      },
      childRows: {
        include: {
          child: {
            include: {
              values: { include: { media: INCLUDE_MEDIA_FILE, multiple: true, range: true } },
            },
          },
        },
      },
    },
  },
};
const includeRowDetails = {
  ...UserModelHelper.includeSimpleCreatedByUser,
  createdByApiKey: true,
  tenant: true,
  values: { include: { media: INCLUDE_MEDIA_FILE, multiple: true, range: true } },
  tags: { include: { tag: true } },
  parentRows: {
    include: includeParentRows,
  },
  childRows: {
    include: includeChildRowsNested,
  },
  permissions: true,
  sampleCustomEntity: true,
};

const includeParentRowsNested = {
  parent: {
    include: {
      createdByUser: { select: UserModelHelper.selectSimpleUserProperties },
      createdByApiKey: true,
      values: { include: { media: INCLUDE_MEDIA_FILE, multiple: true, range: true } },
      parentRows: {
        include: {
          parent: {
            include: {
              values: { include: { media: INCLUDE_MEDIA_FILE, multiple: true, range: true } },
            },
          },
        },
      },
      childRows: {
        include: {
          child: {
            include: {
              values: { include: { media: INCLUDE_MEDIA_FILE, multiple: true, range: true } },
            },
          },
        },
      },
    },
  },
};
const includeRowDetailsNested = {
  ...UserModelHelper.includeSimpleCreatedByUser,
  createdByApiKey: true,
  tenant: true,
  values: { include: { media: INCLUDE_MEDIA_FILE, multiple: true, range: true } },
  tags: { include: { tag: true } },
  parentRows: {
    include: includeParentRowsNested,
  },
  childRows: {
    include: includeChildRowsNested,
  },
  permissions: true,
  sampleCustomEntity: true,
};

export default {
  includeRowDetails,
  includeRowDetailsNested,
};
