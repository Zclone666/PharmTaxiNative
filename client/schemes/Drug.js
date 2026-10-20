export default {
  key: null, // уникальный ключ
  id: "", // айди ДВ или ТН
  name: "", // Название ДВ или ТН
  level: 0, //
  fpid: null, //
  type: null, // ДВ или ТН
  edit: true,
  group: 0, // группа раствора (0 - нет раствора, больше 0 - раствор)
  text: null,
  specials: null,
  freq: null,
  freq_id: null,
  duration: null,
  duration_id: null,
  recipenameid: null,
  solute: false,
  dosage: {
    // дозировка
    form: null,
    method: null,
    pack: {},
    dosage: [],
    value: null,
  },
  calc: {
    dosageBaseUnit: "248",
    countBaseUnit: null,
    dosage: [0],
    count: 1,
    dosageUnit: "248",
    dayCount: 1,
    fullDosage: [0],
    weightDosage: [0],
    dayDosage: [0],
    dayWeightDosage: [0],
  },
  schedule: {
    dateStart: null,
    dateFinish: null,
    finishAlternate: null,
    clarifications: null, //уточнения
    interval: null,
    once: null,
    week: null,
    calendar: null,
  },
  helpers: {
    dosage: {},
    pack: {},
    url: "",
    key: null,
    way: null,
    step: null,
    mnn: false,
    drugCache: null,
  },
};
