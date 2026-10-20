export const meteorAsyncCall = async (name, params) => {
  return new Promise((resolve, reject) =>
    Meteor.call(name, params, (err, res) => {
      resolve({ res, err });
      // if (res) resolve({res, err});
      // if (err) reject({res, err});
    })
  );
};

export const checkDouble = (value, witNill = true) => {
  if (!witNill && (value === 0 || value === "0")) return true;
  // console.log(witNill, value, 'HERE');
  if (!value) return;
  value = value.toString();
  value = (value.replace && value.replace(",", ".")) || "0";
  // console.log(witNill, value, 'HERE');
  let arr = value.split(".");
  // console.log(witNill, arr, 'HERE');
  if (
    value === "" ||
    value === 0 ||
    value === "0" ||
    value === "." ||
    arr[1] === "" ||
    arr[1] === "0" ||
    arr[1] === "00" ||
    arr[1] === "000" ||
    arr[1] === "0000" ||
    arr[1] === "00000" ||
    arr.length > 2
  ) {
    return false;
  }
  return true;
};

export const clearDouble = (value) => {
  // console.log(value);
  if (value === "" || value === ".") return value;
  // console.log(value);
  value = (value.replace && value.replace(",", ".")) || "0";
  // console.log(value);
  let arr = value.split(".");
  // console.log(value);
  if (arr.length > 2) return arr.slice(0, 2).join(".");
  // console.log(value);
  if (value === "0" || value === 0) return "0";
  // console.log(value);
  if (
    arr[1] === "" ||
    arr[1] === "0" ||
    arr[1] === "00" ||
    arr[1] === "000" ||
    arr[1] === "0000" ||
    arr[1] === "00000"
  ) {
    // console.log(value);
    return value;
  }
  return value;
};
