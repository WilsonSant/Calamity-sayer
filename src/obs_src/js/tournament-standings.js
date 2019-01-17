const socket = io('http://localhost:3005/');

class TournamentStandings {
  constructor() {
    this.name = 'Tournament Standings';
  }

  ID() {
    return {
      name: this.name,
    };
  }

  // changes up the state n stuff
  updateState(state) {
    $('#tournament-name').text(state.casters.tournament);
    $('.standings-table').html('');
    let limit = Math.min(state.tournament.standingsSettings.limit, state.tournament.standings.length);

    if (isNaN(limit)) {
      limit = 8;
    }

    // mode setup (still write to tables unless performance becomes a problem?)
    const mode = state.tournament.standingsSettings.mode;

    if (mode === 'focus') {
      $('#topn-table').hide();
      $('#zoom-table').show();
      $('.standings-table').removeClass('dual');
    }
    else if (mode === 'combined') {
      $('#topn-table').show();
      $('#zoom-table').show();
      $('.standings-table').addClass('dual');
    }
    else {
      $('#topn-table').show();
      $('#zoom-table').hide();
      $('.standings-table').removeClass('dual');
    }

    state.tournament.standings.sort(function (a, b) {
      if (a.place < b.place) return -1;

      if (a.place > b.place) return 1;

      return 0;
    });

    // header
    $('.standings-table').append(`
      <div class="header row">
        <div class="field place">Rank</div>
        <div class="field team-name">Team</div>
        <div class="field record">Record</div>
        <div class="field win">Wins</div>
        <div class="field loss">Losses</div>
        <div class="field logo">Logo</div>
      </div>
    `);

    if (mode === 'combined') {
      $('#topn-table').prepend('<div class="alt row">All Teams</div>');
    }

    // top n
    let zoomIdx = 0;
    for (let i = 0; i < state.tournament.standings.length; i++) {
      const r = state.tournament.standings[i];

      if (r.zoom === true) {
        zoomIdx = i;
      }
    }

    const topLimit = mode === 'combined' ? state.tournament.standings.length : limit;
    for (let i = 0; i < topLimit; i++) {
      const r = state.tournament.standings[i];

      $('#topn-table').append(`
        <div class="row ${i % 2 === 0 ? 'even' : 'odd'} ${r.focus || r.zoom ? 'focus' : ''}">
          <div class="field place">${r.place}</div>
          <div class="field team-name">${r.team}</div>
          <div class="field record">${r.win}-${r.loss}</div>
          <div class="field win">${r.win}</div>
          <div class="field loss">${r.loss}</div>
          <div class="field logo">
            <img src="${r.logo}" />
          </div>
        </div>
      `);
    }

    // zoom
    // zoom first needs the location of the zoom team (if any)
    // determine range
    let zmin = Math.max(0, zoomIdx - limit / 2);
    const zmax = Math.min(state.tournament.standings.length, zmin + limit);

    if (zmax - zmin < limit) {
      zmin = Math.max(0, zmax - limit);
    }

    for (let i = zmin; i < zmax; i++) {
      const r = state.tournament.standings[i];

      $('#zoom-table').append(`
        <div class="row ${i % 2 === 0 ? 'even' : 'odd'} ${r.zoom || r.focus ? 'focus' : ''}">
          <div class="field place">${r.place}</div>
          <div class="field team-name">${r.team}</div>
          <div class="field record">${r.win}-${r.loss}</div>
          <div class="field win">${r.win}</div>
          <div class="field loss">${r.loss}</div>
          <div class="field logo">
            <img src="${r.logo}" />
          </div>
        </div>
      `);
    }
  }
}

$(document).ready(() => {
  // just kinda runs on page load huh
  const tournament = new TournamentStandings();

  socket.on('requestID', () => {
    socket.emit('reportID', tournament.ID());
    socket.emit('requestState');
  });

  socket.on('update', (state) => {
    tournament.updateState.call(tournament, state);
  });
  socket.on('changeTheme', (themeDir) => {
    changeTheme(themeDir, 'tournament-standings.css');
  });
});
