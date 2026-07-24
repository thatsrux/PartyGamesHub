const normalizeStr = (str) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
};
const getBaseName = (str) => {
  let base = normalizeStr(str);
  base = base.replace(/[^a-z0-9]/g, ' ');
  base = ' ' + base + ' ';
  const stopwords = [
    ' f c ', ' fc ', ' c f ', ' cf ', ' football club ', ' futbol club ', 
    ' club atletico ', ' club internacional de futbol ', ' club ', 
    ' association ', ' a c ', ' ac ', ' s p a ', ' s s ', ' men s ', ' team ',
    ' nazionale di calcio dell ', ' nazionale di calcio ', ' national football team ',
    ' nazionale ', ' national ', ' dell '
  ];
  stopwords.forEach(word => {
    base = base.replace(new RegExp(word, 'gi'), ' ');
  });
  base = base.replace(/\s+/g, ' ').trim();
  const countryMap = {
    'england': 'inghilterra',
    'united kingdom': 'inghilterra',
    'regno unito': 'inghilterra',
    'spain': 'spagna',
    'italy': 'italia'
  };
  if (countryMap[base]) return countryMap[base];
  return base;
};
console.log("Argentina: " + getBaseName('Argentina'));
console.log("Argentina men's national football team: " + getBaseName("Argentina men's national football team"));
console.log("England men's national association football team: " + getBaseName("England men's national association football team"));
console.log("Club Internacional de Fútbol Miami: " + getBaseName('Club Internacional de Fútbol Miami'));
console.log("Inter Miami CF: " + getBaseName('Inter Miami CF'));
console.log('Inter Miami CF: "' + getBaseName('Inter Miami CF') + '"');
