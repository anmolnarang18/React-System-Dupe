module.exports = {
  SECRET_KEY: "superConfidentialToken",

  DB_URI:
    "mongodb+srv://jiteshs:jiteshs7@cluster0.5h1dazv.mongodb.net/task?retryWrites=true&w=majority",

  EMAIL_VALIDATION:
    /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/,

  TASK_STATUS: {
    NOT_STARTED: "Not Started",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    STOPPED: "Stopped",
  },

  USER_TYPE: {
    ADMIN: "Admin",
    MEMBER: "Member",
  },
};
