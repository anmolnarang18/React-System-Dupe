module.exports = {
  SECRET_KEY: "superConfidentialToken",

  DB_URI:
    "mongodb+srv://jiteshs:jiteshs7@cluster0.5h1dazv.mongodb.net/shift?retryWrites=true&w=majority",

  EMAIL_VALIDATION:
    /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/,

  SHIFT_STATUS: {
    NOT_ASSIGNED:"NOT ASSIGNED",
    CONFIRMED:"CONFIRMED",
    COMPLETED:"COMPLETED",
    CANCELLED:"CANCELLED",
    SWAP: 'SWAP'
  },

  USER_TYPE: {
    MANAGER: "MANAGER",
    WORKER: "WORKER",
  },
};
