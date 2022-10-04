exports.fnc_RetiraNumerosString = function (text) {
  return text.replace(/\D+/g, "");
};
