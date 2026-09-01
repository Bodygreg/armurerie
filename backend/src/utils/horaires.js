const HEURES_FERMETURE = {
  1: 18, // lundi
  2: 18,
  3: 18,
  4: 18,
  5: 18,
  6: 13, // samedi
  // 0 (dimanche) volontairement absent = fermé
};

function calculerDateLimiteRetrait(dateReservation) {
  const candidat = new Date(dateReservation);
  candidat.setDate(candidat.getDate() + 1);

  while (!(candidat.getDay() in HEURES_FERMETURE)) {
    candidat.setDate(candidat.getDate() + 1);
  }

  const heureFermeture = HEURES_FERMETURE[candidat.getDay()];
  candidat.setHours(heureFermeture, 0, 0, 0);
  return candidat;
}

module.exports = { calculerDateLimiteRetrait };