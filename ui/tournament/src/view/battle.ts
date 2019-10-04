import { h } from 'snabbdom'
import { VNode } from 'snabbdom/vnode';

import { bind, onInsert } from './util';
import { TeamBattle, RankedTeam } from '../interfaces';
import TournamentController from '../ctrl';

export function joinWithTeamSelector(ctrl: TournamentController) {
  const onClose = () => {
    ctrl.joinWithTeamSelector = false;
    ctrl.redraw();
  };
  const tb = ctrl.data.teamBattle!;
  return h('div#modal-overlay', {
    hook: bind('click', onClose)
  }, [
    h('div#modal-wrap.team-battle__choice', {
      hook: onInsert(el => {
        el.addEventListener('click', e => e.stopPropagation());
      })
    }, [
      h('span.close', {
        attrs: { 'data-icon': 'L' },
        hook: bind('click', onClose)
      }),
      h('div', [
        h('h2', "Pick your team"),
        h('p', "Which team will you represent in this battle?"),
        ...tb.joinWith.map(id => h('a.button', {
          hook: bind('click', () => ctrl.join(undefined, id), ctrl.redraw)
        }, tb.teams[id]))
      ])
    ])
  ]);
}

export function teamStanding(ctrl: TournamentController, klass?: string): VNode | null {
  const battle = ctrl.data.teamBattle;
  const standing = ctrl.data.teamStanding;
  return battle && standing ? h('table.slist.tour__team-standing' + (klass ? '.' + klass : ''), {
    class: {},
  }, [
    h('tbody', standing.map(rt => teamTr(ctrl, battle, rt)))
  ]) : null;
}

function teamTr(ctrl: TournamentController, battle: TeamBattle, team: RankedTeam) {
  return h('tr', {
    key: team.id,
    class: {
      active: false
    },
    hook: bind('click', _ => {}, ctrl.redraw)
  }, [
    h('td.rank', '' + team.rank),
    h('td.team', battle.teams[team.id]),
    h('td.players', team.players.reduce((acc, p) =>
      acc.concat([
        '+',
        h('score.ulpt.user-link', {
          attrs: { 'data-href': '/@/' + p.user.name },
          hook: {
            destroy: vnode => $.powerTip.destroy(vnode.elm as HTMLElement),
            ...bind('click', _ => ctrl.jumpToPageOf(p.user.name), ctrl.redraw)
          }
        }, '' + p.score)
      ]), [] as (string | VNode)[]
    ).slice(1)),
    h('td.total', [
      h('strong', '' + team.score)
    ])
  ]);
}