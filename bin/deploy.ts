#!/usr/bin/env node

import chalk from 'chalk';
import clear from 'clear';
import figlet from 'figlet';
import { program } from 'commander';
import * as pack from '../package.json';
import cp from 'child_process';
import { execSync } from 'child_process';
import fs from 'fs';

const log = console.log.bind(console);

interface Bash {
  res: string;
  err: string;
}

function image_tag(options) {
  return `${image(options)}:${tag(options)}`;
}

function tag(options) {
  let untracked = '';
  if (options.untracked) {
    untracked = 'untracked-';
  }
  return `local-${untracked}${options.commit}`;
}

function image(options) {
  return `${options.registry}/${options.namespace}/${options.deployment}`;
}

function manifest(options) {
  return `manifest-${tag(options)}.yaml`;
}

function finished(): void {
  log(chalk.green(' FINISHED'));
}

function ok(): void {
  log(chalk.green(' OK'));
}

function line(content) {
  process.stdout.write('\x1b[37m' + content);
}

function message(content: string): void {
  log(chalk.white(content));
}

const capitalize = (s) => {
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
};

function assign_env_vars(options: any) {
  process.env['BUILD_REPOSITORY_URI'] = options.repository_uri;
  process.env['BUILD_REPOSITORY_NAME'] = options.deployment;
  process.env['HOSTNAME'] = options.host;
  process.env['IMAGE'] = image(options);
  process.env['TAG'] = tag(options);
  process.env['NAMESPACE'] = options.namespace;
}

function get_repository_url(): Bash {
  const result = cp.spawnSync('git', ['config', '--get', 'remote.origin.url'], {
    encoding: 'utf8',
  });
  return { res: result.stdout.trim(), err: result.stderr };
}

function git_fetch_origin(): Bash {
  const result = cp.spawnSync('git', ['fetch', 'origin'], {
    encoding: 'utf8',
  });
  return { res: result.stdout.trim(), err: result.stderr };
}

function get_current_commit(): Bash {
  const result = cp.spawnSync('git', ['rev-parse', 'HEAD'], {
    encoding: 'utf8',
  });
  return { res: result.stdout.trim(), err: result.stderr };
}

function get_current_branch(): Bash {
  const result = cp.spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
    encoding: 'utf8',
  });
  return { res: result.stdout.trim(), err: result.stderr };
}

function git_check_commit_remote(commit: string, branch?: string) {
  if (typeof branch === 'undefined') {
    branch = 'master';
  }

  const result = cp.spawnSync(
    'git',
    ['branch', `--contains=${commit}`, `--points-at=origin/${branch}`],
    {
      encoding: 'utf8',
    },
  );
  return { res: result.stdout.trim(), err: result.stderr };
}

function get_current_status(): Bash {
  const result = cp.spawnSync('git', ['status', '-s'], {
    encoding: 'utf8',
  });
  return { res: result.stdout.trim(), err: result.stderr };
}

function get_pwd(): Bash {
  const result = cp.spawnSync('pwd', {
    encoding: 'utf8',
  });
  return { res: result.stdout.trim(), err: result.stderr };
}

function map_cluster_to_env(cluster: string): string {
  cluster = cluster.trim();
  if (cluster.trim() === 'tkg-master') {
    throw new Error(
      'Deploying to cluster tkg-master is not supported! Sorry :(',
    );
  }

  const parts = cluster.split('-');
  return parts[2];
}

function get_cluster(): Bash {
  const result = cp.spawnSync('kubectl', ['config', 'current-context'], {
    encoding: 'utf8',
  });
  return { res: result.stdout.trim(), err: result.stderr };
}

function get_pods(): Bash {
  const result = cp.spawnSync(
    'kubectl',
    ['get', 'pods', '-n', 'kube-system', '--request-timeout=1'],
    {
      encoding: 'utf8',
    },
  );
  return { res: result.stdout.trim(), err: result.stderr };
}

function get_docker(): Bash {
  const result = cp.spawnSync('docker', ['-v'], {
    encoding: 'utf8',
  });
  return { res: result.stdout.trim(), err: result.stderr };
}

function docker_build(options: any) {
  cp.spawnSync(
    'docker',
    ['build', `--tag=${image_tag(options)}`, '--target=prod', '.'],
    {
      stdio: 'inherit',
    },
  );
}

function check_docker_image(options: any) {
  const result = cp.spawnSync(
    'docker',
    ['image', `inspect`, image_tag(options)],
    {
      encoding: 'utf8',
    },
  );
  return { res: result.stdout.trim(), err: result.stderr };
}

function push_docker_image(options: any) {
  cp.spawnSync('docker', ['push', image_tag(options)], {
    stdio: 'inherit',
  });
}

function check_image_in_registry(options: any) {
  const result = cp.spawnSync(
    'docker',
    ['manifest', 'inspect', image_tag(options)],
    {
      encoding: 'utf8',
    },
  );
  return { res: result.stdout.trim(), err: result.stderr };
}

function build_kustomize_manifest(options: any) {
  execSync(
    `kustomize build --load-restrictor LoadRestrictionsNone ${
      options.pwd
    }/kubernetes/envs/${capitalize(options.env)} | envsubst > ${manifest(
      options,
    )}`,
    { encoding: 'utf8' },
  );
}

function apply_to_kubernetes(manifest_path: string) {
  cp.spawnSync('kubectl', ['apply', `-f=${manifest_path}`], {
    stdio: 'inherit',
  });
}

try {
  clear();
  console.log(
    chalk.blue(figlet.textSync('Bratiska-cli', { horizontalLayout: 'full' })),
  );

  program
    .version('1.0')
    .description(
      'Simple Bratiska-cli utility for deploying and managing Bratislava Inovation apps',
    )
    .option('-n, --namespace <namespace>', 'Namespace', 'standalone')
    .option('-d, --deployment <deployment>', 'Deployment app')
    .option('-h, --host <host>', 'Host url address')
    .option('-e, --env <env>', 'Deployment enviroment')
    .option(
      '-r, --registry <url>',
      'Docker image registry url',
      'harbor.bratislava.sk',
    )
    .option('-v, --version <version>', 'Image version')
    .option('--H, --help', 'Help user guide')
    .parse();
  const options = program.opts();

  if (typeof options.namespace === 'undefined') {
    options.namespace = 'stantalone';
  }

  if (typeof options.deployment === 'undefined') {
    options.deployment = pack.name;
  }

  if (typeof options.version === 'undefined') {
    options.version = pack.version;
  }

  line('(0) Checking git...');
  const pwd_bash = get_pwd();
  if (pwd_bash.err !== '') {
    throw new Error('There was an issue getting current working directory!');
  }
  options.pwd = pwd_bash.res;

  const branch_bash = get_current_branch();
  if (branch_bash.err !== '') {
    throw new Error(
      'There was an issue optaining git branch name! Do you have git installed?',
    );
  }
  options.branch = branch_bash.res;

  const repository_bash = get_repository_url();
  if (repository_bash.err !== '') {
    throw new Error(
      'There was an issue getting remote repository url. Please push your changes to github or azure.',
    );
  }
  options.repository_uri = repository_bash.res;

  const fetch_bash = git_fetch_origin();
  if (fetch_bash.err !== '') {
    throw new Error('There was an issue fetching changes from git origin!');
  }
  options.fetch = fetch_bash.res;

  const commit_bash = get_current_commit();
  if (commit_bash.err !== '') {
    throw new Error('There was an issue getting commit!');
  }
  options.commit = commit_bash.res;

  const status_bash = get_current_status();
  if (status_bash.err !== '') {
    throw new Error('There was an issue getting git status!');
  }

  options.untracked = false;
  if (status_bash.res !== '') {
    options.untracked = true;
    line('\nWe have untracked changes in repo, adding tag "untracked"...');
  }

  const remote_commit_bash = git_check_commit_remote(
    options.commit,
    options.branch,
  );
  options.merged = false;
  if (remote_commit_bash.err !== '' && remote_commit_bash.res === '') {
    options.merged = true;
  }
  ok();

  line('(1) Checking current kubernetes cluster...');
  const response_cluster = get_cluster();
  options.cluster = response_cluster.res;
  if (response_cluster.err !== '') {
    throw new Error(
      'There is no kubernetes context available. Please log in to kubernetes cluster! \n More info: ' +
        response_cluster.err,
    );
  }
  ok();

  line('(2) Checking kubernetes connection to cluster...');
  const pods = get_pods();
  if (pods.err !== '') {
    throw new Error(
      `Kubernetes cluster ${options.cluster} is not reachable from your computer! Maybe turn on VPN or check internet connection or sign in to cluster.`,
    );
  }
  ok();

  line('(3) Checking chosen kubernetes cluster with enviroment...');
  if (typeof options.env === 'undefined') {
    options.env = map_cluster_to_env(options.cluster);
  } else if (options.env != map_cluster_to_env(options.cluster)) {
    const cluster_env = map_cluster_to_env(options.cluster);
    throw new Error(
      `Your kubernetes context "${options.cluster}" (${cluster_env}) do not match chosen context (${options.env})! Change with --env or kubernetes cluster context!`,
    );
  }

  switch (options.cluster) {
    case 'tkg-innov-prod':
      if (options.untracked === true) {
        throw new Error(
          `You cannot deploy to 'tkg-innov-prod' when you have untracked changes. Please commit and PR merge your changes to master!`,
        );
      }
      if (options.branch !== 'master') {
        throw new Error(
          `Please checkout git branch to master. Run 'git checkout master'`,
        );
      }
      if (options.merged === false) {
        throw new Error(
          `You cannot deploy to 'tkg-innov-prod' when the changes are not merged in 'master' branch. Please create PR to propagate your changes to master!`,
        );
      }
      break;
    case 'tkg-innov-staging':
      if (options.untracked === true) {
        throw new Error(
          `You cannot deploy to 'tkg-innov-staging' when you have untracked changes. Please commit and push changes to you branch origin/${options.branch}!`,
        );
      }

      if (options.merged === false) {
        throw new Error(
          `You cannot deploy to 'tkg-innov-staging' when the changes are not pushed in branch origin/${options.branch}. Please push your changes!`,
        );
      }
      break;
  }

  line(` we will use ${options.cluster}...`);
  ok();

  if (typeof options.host === 'undefined') {
    let env = options.env;
    if (options.env === 'prod') {
      env = '';
    }
    options.host = options.deployment + '.' + env + '.bratislava.sk';
  }

  line('(4) Checking docker...');
  const docker = get_docker();
  if (docker.err !== '') {
    throw new Error(
      `Docker is not present. Please install docker. More info: ${docker.err}`,
    );
  }
  ok();

  message('(5) Building docker image...');
  message(`Docker image tag: ${image_tag(options)}`);
  docker_build(options);
  finished();

  line('(6) Checking if image was created...');
  const image = check_docker_image(options);
  if (image.err !== '') {
    throw new Error(
      `There was an issue creating docker image! Check above docker build log - stage (5).`,
    );
  }
  const res_json = image.res;
  const iro = JSON.parse(res_json);
  if (iro[0].RepoTags[0] !== image_tag(options)) {
    throw new Error(
      `Image was not properly created. Tags do not fit! More info: ${
        iro[0].RepoTags[0]
      } != ${image_tag(options)}`,
    );
  }
  ok();

  message('(7) Pushing image to regitry ...');
  push_docker_image(options);
  finished();

  line('(8) Checking if image was pushed...');
  const image_r = check_image_in_registry(options);
  if (image_r.err !== '') {
    throw new Error(
      `There was an issue pushing docker image to registry! Propably you are unauthorised. Check above docker push log - stage (7).`,
    );
  }
  ok();

  line('(9) Creating env variables for kustomize...');
  assign_env_vars(options);
  ok();

  line('(10) Building kustomize manifest...');
  build_kustomize_manifest(options);
  ok();

  line('(11) Checking kustomize manifest...');
  const manifest_path = `${options.pwd}/${manifest(options)}`;
  if (!fs.existsSync(manifest_path)) {
    throw new Error(`We had an error creating kustomize manifest.`);
  }
  ok();

  line('(12) Deploying to kubernetes...');
  apply_to_kubernetes(manifest_path);
  finished();

  line('(13) Cleaning manifest...');
  try {
    fs.unlinkSync(manifest_path);
  } catch (err) {
    throw new Error(`We had an error by cleaning manifest file`);
  }
  ok();
} catch (e: any) {
  log('');
  log('\x1b[31m', e.message);
}
