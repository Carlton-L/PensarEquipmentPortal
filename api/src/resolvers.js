module.exports = {
  Query: {
    equipment(_, __, ___) {
      return "Query Result`";
    },
  },
  File: {
    __resolveType(file) {
      if (file.calibrated) return "Calibration";
      return "Receipt";
    },
  },
};
