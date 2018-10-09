const fs = require('fs-extra');

let loadedThemes = {};

function initThemes() {
  $('#theme-menu').dropdown();
  scanThemes();

  $('#rescan-themes').click(scanThemes);
}

function initWithState(state) {
  $('#set-theme').click(() => state.broadcastThemeChange());
  $('#theme-menu').dropdown('set exactly', state.theme.name);
}

function scanThemes() {
  // list things in themes dir. Looking for a 'themes.json' and will check to see if it works.
  // annoyingly configs are different for package and dev
  let themeFolder = 'src/obs_src/themes';

  if (!fs.existsSync('src/obs_src/themes')) {
    themeFolder = `${process.resourcesPath}/app/${themeFolder}`;
  }

  let files = fs.readdirSync(themeFolder);

  loadedThemes = {};
  for (let file of files) {
    if (fs.existsSync(`${themeFolder}/${file}/theme.json`)) {
      // read the file
      let themeData = fs.readJsonSync(`${themeFolder}/${file}/theme.json`, { throws: false });

      // check for required themes
      if ('name' in themeData && 'version' in themeData && 'author' in themeData && 'folderName' in themeData) {
        loadedThemes[themeData.name] = themeData;
      }
    }
  }

  // update the dropdown
  let values = { values: [{ value: '', text: 'Default Theme', name: 'Default Theme' }] };
  for (let theme in loadedThemes) {
    let t = loadedThemes[theme];
    values.values.push({ value: theme, text: `${t.name} v${t.version} by ${t.author}`, name: `${t.name} v${t.version} by ${t.author}` });
  }

  $('#theme-menu').dropdown('setup menu', values);

  if (appState)
    $('#theme-menu').dropdown('set exactly', appState.theme.name);
}

function getTheme(id) {
  return loadedThemes[id];
}

exports.Init = initThemes;
exports.InitWithState = initWithState;
exports.getTheme = getTheme;