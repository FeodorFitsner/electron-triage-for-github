import Octokat from 'octokat';
import { decryptData } from '../utils/cryptData';
import { fetchAll } from '../utils/octokat-helper';
export const TYPE_PULL = 'TYPE_PULL';
export const TYPE_ISSUE = 'TYPE_ISSUE';

function mixRepos(...repos) {
  return Object.assign([], ...repos);
}

function mixWatchedAndNotUserRepos(...repos) {
  repos;
  return [];
}

function fetchUserReposPromise({octo, since} = {}) {
  return fetchAll(octo.user.repos.fetch, {
    per_page: 100,
    sort: 'pushed',
    direction: 'desc'
  }).then((value) => {
    return value.filter((repo) => {
      return (repo.pushedAt && repo.pushedAt >= since) || (repo.updatedAt && repo.updatedAt >= since);
    });
  });
}

function fetchWatchedReposPromise({octo, since} = {}) {
  octo, since;
  return Promise.resolve([]);
}

function fetchUserIssuesPromise({octo, since} = {}) {
  return fetchAll(octo.issues.fetch, {
    per_page: 100,
    filter: 'all',
    state: 'all',
    sort: 'updated',
    since: since.toISOString()
  });
}

function fetchReposIssuesPromise({repos, since} = {}) {
  repos, since;
  return Promise.resolve([]);
}

function appendPullRequestPromiseArray(data = []) {
  return data.map((story) => {
    if(!story.issue.pullRequest) {
      return Promise.resolve(Object.assign({}, story, { type: TYPE_ISSUE }));
    }
    return story.issue.pullRequest.fetch({
      per_page: 100
    }).then((pull) => {
      return Object.assign({}, story, { pull: pull, type: TYPE_PULL });
    });
  });
}

function appendStatusPromiseArray(data = []) {
  return data.map((story) => {
    if(!story.pull) {
      return Promise.resolve(story);
    }
    return story.repo.commits(story.pull.head.sha).status.fetch({
      per_page: 100
    }).then((status) => {
      return Object.assign({}, story, { status: status });
    });
  });
}

export function fetchCraftedStories(settings = {}) {
  return new Promise((resolve1) => {
    const now = new Date();
    const since = new Date(now - 5 * 24 * 60 * 60 * 1000);
    const token = decryptData(settings.token);
    const octo = new Octokat({
      token: token,
      rootURL: settings.apiendpoint
    });
    let repos;
    let userRepos;
    let watchedRepos;
    let watchedAndNotUserRepos;
    Promise.all([
      fetchUserReposPromise({octo: octo, since: since}),
      fetchWatchedReposPromise({octo: octo, since: since})
    ]).then((value) => {
      [ userRepos, watchedRepos ] = value;
      repos = mixRepos(userRepos, watchedRepos);
      repos;
      watchedAndNotUserRepos = mixWatchedAndNotUserRepos(watchedRepos, userRepos);
      return Promise.all([
        fetchUserIssuesPromise({octo: octo, since: since}),
        fetchReposIssuesPromise({repos: watchedAndNotUserRepos, since: since})
      ]).then((value) => {
        const [userIssues, reposIssues] = value;
        return userIssues.concat(reposIssues).map((issue) => {
          return {
            id: `issue:${issue.id}`,
            issue: issue,
            repo: issue.repository
          };
        });
      });
    }).then((value) => {
      return Promise.all(appendPullRequestPromiseArray(value));
    }).then((value) => {
      return Promise.all(appendStatusPromiseArray(value));
    }).then((value) => {
      resolve1(value);
    });
  });
}