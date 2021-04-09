module.exports = {
  Query: {
    equipmentById(_, __, ___) {
      return { id: "dfnsjdfns" };
    },
  },
  File: {
    __resolveType(file) {
      if (file.calibrated) return "Calibration";
      return "Receipt";
    },
  },
};
